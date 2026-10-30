export const subscriptionPlans = [
  { id: "1-month", label: "1 mes", months: 1, environmentVariable: "STRIPE_PREMIUM_PRICE_1_MONTH" },
  { id: "3-months", label: "3 meses", months: 3, environmentVariable: "STRIPE_PREMIUM_PRICE_3_MONTHS" },
  { id: "6-months", label: "6 meses", months: 6, environmentVariable: "STRIPE_PREMIUM_PRICE_6_MONTHS" },
  { id: "12-months", label: "12 meses", months: 12, environmentVariable: "STRIPE_PREMIUM_PRICE_12_MONTHS" }
];

export function stripePriceIdForPlan(planId) {
  const plan = subscriptionPlans.find((entry) => entry.id === planId);
  if (!plan) return "";

  const priceId = process.env[plan.environmentVariable]?.trim();
  if (priceId) return priceId;

  return plan.id === "1-month" ? process.env.STRIPE_PREMIUM_PRICE_ID?.trim() || "" : "";
}

export function stripePriceMatchesPlan(price, plan) {
  return Boolean(price?.active
    && price.type === "recurring"
    && price.recurring?.interval === "month"
    && price.recurring.interval_count === plan.months
    && price.currency === "eur"
    && Number(price.unit_amount) > 0);
}
