// agentic/pages/api/stripe/checkout.ts
import { NextApiRequest, NextApiResponse } from "next";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import User from "@/core/user/user.model";
import Subscription from "@/core/subscription/subscription.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Stripe Checkout API called with method:", req.method);
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    console.log("Invalid method, only POST allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, plan } = req.body;
  if (!userId || !plan) {
    console.log("Missing parameters:", { userId, plan });
    return res.status(400).json({ error: "Missing parameters" });
  }

  await connectDB();
  console.log("MongoDB connected successfully");

  const user = await User.findById(userId);
  if (!user) {
    console.log("User not found for userId:", userId);
    return res.status(404).json({ error: "User not found" });
  }
  console.log("User found:", user.email);

  const existingSub = await Subscription.findOne({ userId, status: "active" });
  if (existingSub) {
    console.log("User already has active subscription:", existingSub);
    return res
      .status(400)
      .json({ error: "You already have an active subscription" });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    console.log("Invalid plan, no priceId found for plan:", plan);
    return res.status(400).json({ error: "Invalid plan" });
  }
  console.log("Price ID found for plan:", plan, priceId);

  try {
    let customerId = user.stripeCustomerId;
    console.log("Existing Stripe customer ID:", customerId);

    if (!customerId) {
      console.log("Creating new Stripe customer for email:", user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
      console.log("New Stripe customer created:", customerId);
    }

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/register`,
      metadata: { userId: user._id.toString(), plan },
    });

    console.log("Stripe session created successfully:", session.id);
    console.log("Session URL:", session.url);

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Stripe checkout error" });
  }
}
