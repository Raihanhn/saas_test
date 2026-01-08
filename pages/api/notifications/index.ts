// pages/api/notifications/index.ts
import Notification from "@/modules/notifications/notification.model";
import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) return res.status(401).json({ message: "Unauthorized" });

  if ((session.user as any).role !== "client") {
    return res.status(403).json({ message: "Clients only" });
  }

  try {
    const userId = (session.user as any).id;

    const notifications = await Notification.find({
      userId,
      read: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({ count: notifications.length, notifications });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
}
