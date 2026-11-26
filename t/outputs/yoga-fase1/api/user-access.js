import { getServerDatabase, responseJson } from "../lib/payments.js";

function requestOriginIsAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const siteUrl = String(process.env.SITE_URL || "").trim().replace(/\/$/, "");
  if (siteUrl) allowedOrigins.add(siteUrl);
  return allowedOrigins.has(origin);
}

function secureEqual(left, right) {
  const leftBytes = new TextEncoder().encode(String(left));
  const rightBytes = new TextEncoder().encode(String(right));
  if (leftBytes.length !== rightBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }
    if (!requestOriginIsAllowed(request)) {
      return responseJson({ message: "No se pudo validar el origen de la solicitud." }, 403);
    }

    try {
      const body = await request.json();
      const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
      const passwordHash = String(body.passwordHash || "").slice(0, 250);
      if (!email || !passwordHash) {
        return responseJson({ message: "No se pudo comprobar el acceso de la cuenta." }, 400);
      }

      const database = getServerDatabase();
      const { data: user, error: userError } = await database
        .from("users")
        .select("id,email,password_hash,is_premium,subscription_status,premium_until,stripe_customer_id")
        .eq("email", email)
        .maybeSingle();
      if (userError) throw userError;
      if (!user || !secureEqual(user.password_hash || "", passwordHash)) {
        return responseJson({ message: "No se pudo validar la cuenta." }, 403);
      }

      const { data: purchases, error: purchaseError } = await database
        .from("lesson_purchases")
        .select("lesson_id,expires_at")
        .eq("user_id", user.id)
        .eq("status", "paid");
      if (purchaseError) throw purchaseError;

      const now = Date.now();
      const activePurchases = (purchases || []).filter((purchase) => (
        !purchase.expires_at || Date.parse(purchase.expires_at) > now
      ));

      return responseJson({
        premium: Boolean(user.is_premium),
        subscriptionStatus: user.subscription_status || "inactive",
        premiumUntil: user.premium_until || null,
        stripeCustomerId: user.stripe_customer_id || null,
        purchases: activePurchases.map((purchase) => ({
          lessonId: purchase.lesson_id,
          expiresAt: purchase.expires_at || null
        }))
      });
    } catch (error) {
      console.error("Could not load user access:", error);
      return responseJson({ message: "No se pudo actualizar el acceso de la cuenta." }, 500);
    }
  }
};
