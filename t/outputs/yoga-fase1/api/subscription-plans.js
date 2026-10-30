import {
  getStripe,
  publicErrorMessage,
  responseJson
} from "../lib/payments.js";
import {
  stripePriceMatchesPlan,
  stripePriceIdForPlan,
  subscriptionPlans
} from "../lib/subscription-plans.js";

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return responseJson({ message: "Metodo no permitido." }, 405);
    }

    try {
      const stripe = getStripe();
      const plans = await Promise.all(subscriptionPlans.map(async (plan) => {
        const priceId = stripePriceIdForPlan(plan.id);
        if (!priceId) {
          return {
            id: plan.id,
            label: plan.label,
            months: plan.months,
            available: false
          };
        }

        const price = await stripe.prices.retrieve(priceId);
        if (!stripePriceMatchesPlan(price, plan)) {
          throw new Error(`El precio de Stripe configurado para ${plan.label} no coincide con un plan recurrente en EUR.`);
        }

        return {
          id: plan.id,
          label: plan.label,
          months: plan.months,
          amount: price.unit_amount,
          currency: price.currency,
          available: true
        };
      }));

      return responseJson({ plans });
    } catch (error) {
      console.error("Could not load Stripe subscription plans:", error);
      return responseJson({
        message: "Los planes no estan disponibles ahora. Vuelve a intentarlo mas tarde."
      }, 503);
    }
  }
};
