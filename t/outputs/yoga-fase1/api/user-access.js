import { authenticateRequest, getServerDatabase, responseJson } from "../lib/payments.js";

function requestOriginIsAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const siteUrl = String(process.env.SITE_URL || "").trim().replace(/\/$/, "");
  if (siteUrl) allowedOrigins.add(siteUrl);
  return allowedOrigins.has(origin);
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
      const database = getServerDatabase();
      const user = await authenticateRequest(request, database);
      if (!user) return responseJson({ message: "Inicia sesion de nuevo para continuar." }, 401);

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
