
//pages/api/profile/password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import User from "@/core/user/user.model";
import bcrypt from "bcryptjs";

connectDB();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const { current, newPassword } = req.body;

  try {
    const user = await User.findById((session.user as any).id).select("+password");
    if (!user || !user.password) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(current, user.password);
    if (!isValid) return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
}
