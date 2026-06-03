import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

export function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  if (!cachedStripe) {
    cachedStripe = new Stripe(apiKey);
  }
  return cachedStripe;
}

export type PaidPlan = 'pro' | 'creator' | 'team';

export const STRIPE_PRICE_BY_PLAN: Record<PaidPlan, string | undefined> = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID,
  creator: process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID || process.env.STRIPE_CREATOR_PRICE_ID,
  team: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID || process.env.STRIPE_TEAM_PRICE_ID,
};

export function planFromPriceId(priceId?: string | null): PaidPlan | null {
  if (!priceId) return null;
  for (const [plan, id] of Object.entries(STRIPE_PRICE_BY_PLAN)) {
    if (id && id === priceId) return plan as PaidPlan;
  }
  return null;
}
