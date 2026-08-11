import {
  applyCheckoutSession,
  getServerDatabase,
  getStripe,
  responseJson,
  updateSubscription,
  updateSubscriptionFromInvoice
} from "../lib/payments.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    const stripe = getStripe();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!signature || !webhookSecret) {
      return responseJson({ message: "Webhook de Stripe sin configurar." }, 400);
    }

    let event;
    try {
      const rawBody = await request.text();
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("Invalid Stripe webhook signature:", error);
      return responseJson({ message: "Firma de Stripe no valida." }, 400);
    }

    try {
      const database = getServerDatabase();
      switch (event.type) {
        case "checkout.session.completed":
          await applyCheckoutSession(database, stripe, event.data.object);
          break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await updateSubscription(database, event.data.object);
          break;
        case "invoice.paid":
          await updateSubscriptionFromInvoice(database, event.data.object, true);
          break;
        case "invoice.payment_failed":
          await updateSubscriptionFromInvoice(database, event.data.object, false);
          break;
        default:
          break;
      }

      return responseJson({ received: true });
    } catch (error) {
      console.error(`Could not process Stripe event ${event.id}:`, error);
      return responseJson({ message: "No se pudo guardar el evento de Stripe." }, 500);
    }
  }
};
