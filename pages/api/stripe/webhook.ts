// agentic/pages/api/stripe/webhook.ts
import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Subscription from "@/core/subscription/subscription.model";
import User from "@/core/user/user.model";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await connectDB();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !session.subscription) break;

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
            stripeCustomerId: stripeSubscription.customer, 
            plan,
            currentPeriodEnd,
            trialEnd: undefined,
            isTrial: false,
          },
          { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, {
          currentPlan: plan,
          subscriptionCurrentPeriodEnd: currentPeriodEnd,
        });

        console.log(` Paid plan activated for user ${userId}`);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadataUserId = subscription.metadata?.userId;
        if (!metadataUserId) break;

        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.id
        );

        const currentPeriodEnd = new Date(
          stripeSubscription.items.data[0].current_period_end * 1000
        );

        await Subscription.findOneAndUpdate(
          { userId: metadataUserId },
          {
            status: stripeSubscription.status,
            currentPeriodEnd,
          },
          { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(metadataUserId, {
          currentPlan:
            stripeSubscription.items.data[0].price.nickname?.toLowerCase() ||
            "pro",
          subscriptionCurrentPeriodEnd: currentPeriodEnd,
        });

        console.log(`Subscription updated for user ${metadataUserId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
