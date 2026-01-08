//pages/api/stripe/manage.ts
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import User from "@/core/user/user.model";
import { connectDB } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  const user = await User.findById((session.user as any).id);
  if (!user || !user.stripeCustomerId) {
    return res.status(404).json({ error: "Stripe customer not found" });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard/settings",
  });

  res.status(200).json({ url: portalSession.url });
}

