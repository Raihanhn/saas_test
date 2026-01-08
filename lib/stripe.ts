// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const STRIPE_PRICE_IDS: Record<string, string> = {
  free: "",
  pro: "price_1SiO7mDuDFAFM6tLlbIoAhpV",
  enterprise: "price_1SiO8GDuDFAFM6tLY7dDAutr",
};
