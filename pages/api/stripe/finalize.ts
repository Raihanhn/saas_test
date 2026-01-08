//pages/api/stripe/finalize.ts
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import User from "@/core/user/user.model";
import Subscription from "@/core/subscription/subscription.model";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(" /api/stripe/finalize called");

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { sessionId } = req.body;
  console.log("Received sessionId:", sessionId);

  if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

  await connectDB();
  console.log(" Connected to DB");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(" Stripe session retrieved:", session.id);

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    console.log("Session metadata:", { userId, plan });

    if (!userId)
      return res.status(400).json({ error: "Invalid session metadata" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    console.log(" User found:", user.email);

    if (session.subscription) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const currentPeriodEnd = new Date(
        stripeSubscription.items.data[0].current_period_end * 1000
      );

      await Subscription.findOneAndUpdate(
        { userId },
        {
          status: "active",
          stripeSubscriptionId: stripeSubscription.id,
          plan,
          currentPeriodEnd,
        },
        { upsert: true, new: true }
      );

      user.stripeSubscriptionId = stripeSubscription.id;
      user.currentPlan = plan;
      user.subscriptionCurrentPeriodEnd = currentPeriodEnd;
      await user.save();

      console.log(
        `Subscription updated for ${user.email}, plan: ${plan}, period ends: ${currentPeriodEnd}`
      );
    } else {
      console.log(" No subscription attached to session");
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.loginToken = token;
    user.loginTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    console.log(
      ` Temporary login token generated for ${user.email}: ${token}`
    );

    res.status(200).json({ token });
  } catch (err: any) {
    console.error(" Error in /api/stripe/finalize:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
