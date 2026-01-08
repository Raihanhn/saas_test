// agentic/pages/api/subscription-invoices.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Subscription from "@/core/subscription/subscription.model";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "GET") {
  return res.status(405).json({ message: "Method not allowed" });
}


  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const role = (session.user as any).role;
  const adminId = (session.user as any).id;

  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const subscriptions = await Subscription.find({ userId: adminId }) .select("plan status createdAt currentPeriodEnd trialEnd")
  .sort({ createdAt: -1 })
  .lean();

  res.status(200).json({ subscriptions });
}
