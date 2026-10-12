import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

let stripeClient;
let databaseClient;

function requiredEnvironmentValue(name, aliases = []) {
  const variableNames = [name, ...aliases];
  for (const variableName of variableNames) {
    const value = process.env[variableName]?.trim();
    if (value) return value;
  }

  const error = new Error(`Falta la variable de entorno ${variableNames.join(" o ")} en Vercel.`);
  error.name = "ConfigurationError";
  throw error;
}

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(requiredEnvironmentValue("STRIPE_SECRET_KEY"));
  }
  return stripeClient;
}

export function getServerDatabase() {
  if (!databaseClient) {
    databaseClient = createClient(
      requiredEnvironmentValue("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]),
      requiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return databaseClient;
}

export function responseJson(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export function checkoutSiteUrl(request) {
  const configuredUrl = process.env.SITE_URL?.trim().replace(/\/$/, "");
  return configuredUrl || new URL(request.url).origin;
}

export function publicErrorMessage(error) {
  if (error?.name === "ConfigurationError") return error.message;
  if (error?.type?.startsWith("Stripe")) return error.message;
  return "No se pudo preparar el pago. Revisa la configuracion del servidor.";
}

export async function findUser(database, { userId, email } = {}) {
  const columns = "id,email,full_name,role,is_premium,stripe_customer_id,stripe_subscription_id,subscription_status";

  if (userId) {
    const { data, error } = await database
      .from("users")
      .select(columns)
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  if (!email) return null;
  const normalizedEmail = String(email).trim().toLowerCase();
  const { data, error } = await database
    .from("users")
    .select(columns)
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function stripeObjectId(value) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id || null;
}

function databaseSubscriptionStatus(stripeStatus) {
  if (stripeStatus === "trialing") return "trialing";
  if (stripeStatus === "active") return "active";
  if (stripeStatus === "past_due") return "past_due";
  if (stripeStatus === "canceled") return "canceled";
  return "inactive";
}

function subscriptionPeriodEnd(subscription) {
  const seconds = subscription?.current_period_end
    || subscription?.items?.data?.[0]?.current_period_end
    || null;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

export async function updateSubscription(database, subscription) {
  const subscriptionId = stripeObjectId(subscription);
  const customerId = stripeObjectId(subscription?.customer);
  const userId = subscription?.metadata?.userId || null;
  let user = await findUser(database, { userId });

  if (!user && subscriptionId) {
    const { data, error } = await database
      .from("users")
      .select("id,email")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();
    if (error) throw error;
    user = data;
  }

  if (!user && customerId) {
    const { data, error } = await database
      .from("users")
      .select("id,email")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (error) throw error;
    user = data;
  }

  if (!user) throw new Error("No se encontro el usuario de la suscripcion.");

  const subscriptionStatus = databaseSubscriptionStatus(subscription.status);
  const premiumActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const { error } = await database
    .from("users")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: subscriptionStatus,
      is_premium: premiumActive,
      premium_until: subscriptionPeriodEnd(subscription)
    })
    .eq("id", user.id);
  if (error) throw error;

  return {
    userId: user.id,
    email: user.email,
    premium: premiumActive,
    subscriptionStatus
  };
}

export async function updateSubscriptionFromInvoice(database, invoice, paid) {
  const subscriptionId = stripeObjectId(invoice?.subscription)
    || stripeObjectId(invoice?.parent?.subscription_details?.subscription);
  const customerId = stripeObjectId(invoice?.customer);
  let query = database.from("users").select("id,email");

  if (subscriptionId) query = query.eq("stripe_subscription_id", subscriptionId);
  else if (customerId) query = query.eq("stripe_customer_id", customerId);
  else return null;

  const { data: user, error: userError } = await query.maybeSingle();
  if (userError) throw userError;
  if (!user) return null;

  const periodEndSeconds = invoice?.lines?.data?.[0]?.period?.end || null;
  const payload = {
    subscription_status: paid ? "active" : "past_due",
    is_premium: Boolean(paid)
  };
  if (periodEndSeconds) payload.premium_until = new Date(periodEndSeconds * 1000).toISOString();

  const { error } = await database.from("users").update(payload).eq("id", user.id);
  if (error) throw error;
  return { userId: user.id, email: user.email, premium: Boolean(paid) };
}

export async function applyCheckoutSession(database, stripe, session) {
  if (session.status !== "complete") {
    return { accessGranted: false, reason: "checkout_incomplete" };
  }

  const purchaseType = session.metadata?.purchaseType;
  const user = await findUser(database, {
    userId: session.metadata?.userId,
    email: session.metadata?.userEmail || session.customer_details?.email
  });
  if (!user) throw new Error("No se encontro el usuario asociado al pago.");

  if (purchaseType === "lesson") {
    if (session.payment_status !== "paid") {
      return { accessGranted: false, reason: "payment_pending" };
    }

    const lessonId = session.metadata?.lessonId;
    if (!lessonId) throw new Error("La compra no contiene una leccion valida.");
    const paymentIntentId = stripeObjectId(session.payment_intent);
    const { error } = await database
      .from("lesson_purchases")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        amount: Number(session.amount_total || 0) / 100,
        currency: String(session.currency || "eur").toUpperCase(),
        status: "paid",
        stripe_payment_intent_id: paymentIntentId,
        purchased_at: new Date().toISOString()
      }, {
        onConflict: "user_id,lesson_id"
      });
    if (error) throw error;

    return {
      accessGranted: true,
      purchaseType,
      userId: user.id,
      email: user.email,
      lessonId
    };
  }

  if (purchaseType === "subscription") {
    const subscriptionId = stripeObjectId(session.subscription);
    if (!subscriptionId) throw new Error("Stripe no devolvio la suscripcion creada.");
    const subscription = typeof session.subscription === "object"
      ? session.subscription
      : await stripe.subscriptions.retrieve(subscriptionId);
    const result = await updateSubscription(database, subscription);
    return {
      accessGranted: result.premium,
      purchaseType,
      ...result
    };
  }

  throw new Error("Tipo de compra desconocido.");
}
