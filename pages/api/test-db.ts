// pages/api/test-db.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/db";
import User from "../../core/user/user.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();

    const testUser = new User({
      name: "Browser Test User",
      email: "browsertest@example.com",
      password: "123456",
      role: "client",
    });
    await testUser.save();

    const users = await User.find();

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(" DB Test Error:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : error });
  }
}

