// Plan configuration
export const PLANS = {
  FREE: {
    name: 'Free',
    limit: 10,
    period: 'day',
    price: 0,
  },
  PRO: {
    name: 'Pro',
    limit: 100,
    period: 'month',
    price: 9.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
}; 