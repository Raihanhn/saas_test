//pages/api/subscription/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Subscription from "@/core/subscription/subscription.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
  return res.status(405).json({ error: "Method not allowed" });
}


  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  const userId = new mongoose.Types.ObjectId(
    (session.user as any).id
  );

  const subscription = await Subscription.findOne({
    userId,
    status: { $in: ["active", "trial"] },
  }).lean();

  return res.status(200).json({ subscription });
}
