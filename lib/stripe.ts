import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-11-20.acacia" as any })
  : (null as unknown as Stripe);

export const PRICE_LOOKUP: Record<
  "MAP" | "OPS" | "BRANCH",
  { quarterly?: string; annual?: string }
> = {
  MAP: {
    quarterly: process.env.STRIPE_PRICE_MAP_QUARTERLY,
    annual: process.env.STRIPE_PRICE_MAP_ANNUAL,
  },
  OPS: {
    quarterly: process.env.STRIPE_PRICE_OPS_QUARTERLY,
    annual: process.env.STRIPE_PRICE_OPS_ANNUAL,
  },
  BRANCH: {
    quarterly: process.env.STRIPE_PRICE_BRANCH_QUARTERLY,
    annual: process.env.STRIPE_PRICE_BRANCH_ANNUAL,
  },
};
