import Stripe from 'stripe';
import { hasStripe } from './env';

export const stripe = hasStripe ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PRICE_IDS = {
  BASE: { monthly: process.env.STRIPE_PRICE_BASE_MONTHLY, yearly: process.env.STRIPE_PRICE_BASE_YEARLY },
  PRO: { monthly: process.env.STRIPE_PRICE_PRO_MONTHLY, yearly: process.env.STRIPE_PRICE_PRO_YEARLY },
};

export function getPriceId(plan, interval) {
  return PRICE_IDS[plan]?.[interval] || null;
}

export function planFromPriceId(priceId) {
  for (const [plan, prices] of Object.entries(PRICE_IDS)) {
    if (Object.values(prices).includes(priceId)) return plan;
  }
  return null;
}
