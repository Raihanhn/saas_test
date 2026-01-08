import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/core/user/user.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;

  if (!token) return res.status(400).json({ error: "Missing token" });

  await connectDB();

  try {
    const user = await User.findOne({
      loginToken: token,
      loginTokenExpiry: { $gt: new Date() },
    });

   if (!user || !user.isActive) {
  return res.status(401).json({ error: "Account disabled" });
}

    user.loginToken = undefined;
    user.loginTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      id: user._id.toString(),
      email: user.email,
      name: user.name, 
      role: user.role,
      adminId: user.role === "admin" ? user._id : user.createdBy,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
