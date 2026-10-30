import {
  checkoutSiteUrl,
  findUser,
  getServerDatabase,
  getStripe,
  publicErrorMessage,
  responseJson
} from "../lib/payments.js";
import {
  stripePriceMatchesPlan,
  stripePriceIdForPlan,
  subscriptionPlans
} from "../lib/subscription-plans.js";

function checkoutCustomer(user) {
  return user.stripe_customer_id
    ? { customer: user.stripe_customer_id }
    : { customer_email: user.email };
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    try {
      const body = await request.json();
      const purchaseType = body.purchaseType;
      const subscriptionPlanId = String(body.subscriptionPlanId || "");
      const email = String(body.email || "").trim().toLowerCase();
      if (!email || !["lesson", "subscription"].includes(purchaseType)) {
        return responseJson({ message: "La solicitud de pago no es valida." }, 400);
      }

      const database = getServerDatabase();
      const stripe = getStripe();
      const user = await findUser(database, { userId: body.userId, email });
      if (!user || user.email !== email) {
        return responseJson({ message: "No se encontro tu cuenta en la base de datos." }, 404);
      }
      if (user.role === "teacher" || user.role === "admin") {
        return responseJson({ message: "La cuenta de profesora ya tiene acceso al contenido." }, 409);
      }

      const siteUrl = checkoutSiteUrl(request);
      const metadata = {
        purchaseType,
        userId: user.id,
        userEmail: user.email
      };
      const sessionOptions = {
        mode: purchaseType === "lesson" ? "payment" : "subscription",
        locale: "es",
        success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#dashboard`,
        cancel_url: `${siteUrl}/?checkout=cancel#dashboard`,
        client_reference_id: user.id,
        metadata,
        ...checkoutCustomer(user)
      };

      if (purchaseType === "lesson") {
        const lessonId = String(body.lessonId || "");
        const { data: lesson, error } = await database
          .from("lessons")
          .select("id,title,description,is_premium,is_published,price_individual")
          .eq("id", lessonId)
          .eq("is_published", true)
          .maybeSingle();
        if (error) throw error;

        const unitAmount = Math.round(Number(lesson?.price_individual || 0) * 100);
        if (!lesson || !lesson.is_premium || unitAmount <= 0) {
          return responseJson({ message: "Este contenido no admite compra individual." }, 400);
        }

        const { data: previousPurchase, error: purchaseError } = await database
          .from("lesson_purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("lesson_id", lesson.id)
          .eq("status", "paid")
          .maybeSingle();
        if (purchaseError) throw purchaseError;
        if (previousPurchase) {
          return responseJson({ message: "Este contenido ya esta comprado en tu cuenta." }, 409);
        }

        metadata.lessonId = lesson.id;
        sessionOptions.line_items = [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: lesson.title,
              description: String(lesson.description || "Contenido individual de Reset de Conciencia").slice(0, 500)
            }
          }
        }];
        sessionOptions.payment_intent_data = { metadata };
      } else {
        if (user.is_premium && ["active", "trialing"].includes(user.subscription_status)) {
          return responseJson({ message: "Tu suscripcion premium ya esta activa." }, 409);
        }
        const plan = subscriptionPlans.find((entry) => entry.id === subscriptionPlanId);
        const premiumPriceId = stripePriceIdForPlan(subscriptionPlanId);
        if (!plan) {
          return responseJson({ message: "Selecciona un plan de suscripcion valido." }, 400);
        }
        if (!premiumPriceId) {
          const error = new Error(`Falta configurar el precio de Stripe para el plan de ${plan.label}.`);
          error.name = "ConfigurationError";
          throw error;
        }
        const stripePrice = await stripe.prices.retrieve(premiumPriceId);
        if (!stripePriceMatchesPlan(stripePrice, plan)) {
          const error = new Error(`El precio de Stripe para el plan de ${plan.label} no esta configurado correctamente.`);
          error.name = "ConfigurationError";
          throw error;
        }
        metadata.subscriptionPlanId = plan.id;
        sessionOptions.line_items = [{ price: premiumPriceId, quantity: 1 }];
        sessionOptions.subscription_data = { metadata };
      }

      const session = await stripe.checkout.sessions.create(sessionOptions);
      return responseJson({ url: session.url });
    } catch (error) {
      console.error("Could not create Stripe Checkout Session:", error);
      return responseJson({ message: publicErrorMessage(error) }, 500);
    }
  }
};
