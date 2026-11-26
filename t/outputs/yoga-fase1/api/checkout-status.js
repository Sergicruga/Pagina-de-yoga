import {
  applyCheckoutSession,
  authenticateRequest,
  getServerDatabase,
  getStripe,
  publicErrorMessage,
  responseJson
} from "../lib/payments.js";

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    try {
      const sessionId = new URL(request.url).searchParams.get("session_id") || "";
      if (!/^cs_(test|live)_/.test(sessionId)) {
        return responseJson({ message: "La sesion de pago no es valida." }, 400);
      }

      const stripe = getStripe();
      const database = getServerDatabase();
      const user = await authenticateRequest(request, database);
      if (!user) return responseJson({ message: "Inicia sesion de nuevo para confirmar el pago." }, 401);
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"]
      });
      if (session.metadata?.userId !== user.id) {
        return responseJson({ message: "La sesion de pago no pertenece a esta cuenta." }, 403);
      }
      const result = await applyCheckoutSession(database, stripe, session);

      return responseJson({
        accessGranted: Boolean(result.accessGranted),
        purchaseType: result.purchaseType || session.metadata?.purchaseType || null,
        email: result.email || session.metadata?.userEmail || session.customer_details?.email || null,
        lessonId: result.lessonId || session.metadata?.lessonId || null,
        subscriptionStatus: result.subscriptionStatus || null,
        stripeCustomerId: result.stripeCustomerId || null,
        premiumUntil: result.premiumUntil || null,
        expiresAt: result.expiresAt || null,
        paymentStatus: session.payment_status,
        checkoutStatus: session.status
      });
    } catch (error) {
      console.error("Could not verify Stripe Checkout Session:", error);
      return responseJson({ message: publicErrorMessage(error) }, 500);
    }
  }
};
