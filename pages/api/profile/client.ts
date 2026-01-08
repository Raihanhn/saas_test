//pages/api/profile/client.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import User from "@/core/user/user.model";

connectDB();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findById((session.user as any).id).select("-password -stripeCustomerId -stripeSubscriptionId")
  .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
}
