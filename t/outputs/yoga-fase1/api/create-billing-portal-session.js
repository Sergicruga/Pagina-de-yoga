import {
  checkoutSiteUrl,
  findUser,
  getServerDatabase,
  getStripe,
  publicErrorMessage,
  responseJson
} from "../lib/payments.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    try {
      const body = await request.json();
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) return responseJson({ message: "La cuenta no es valida." }, 400);

      const database = getServerDatabase();
      const user = await findUser(database, { userId: body.userId, email });
      if (!user || user.email !== email) {
        return responseJson({ message: "No se encontro tu cuenta." }, 404);
      }
      if (!user.stripe_customer_id) {
        return responseJson({ message: "No hay una suscripcion de Stripe para esta cuenta." }, 409);
      }

      const stripe = getStripe();
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${checkoutSiteUrl(request)}/#dashboard`
      });
      return responseJson({ url: portalSession.url });
    } catch (error) {
      console.error("Could not create Stripe billing portal session:", error);
      return responseJson({ message: publicErrorMessage(error) }, 500);
    }
  }
};
