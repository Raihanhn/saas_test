import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Notification from "@/modules/notifications/notification.model";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const userId = (session.user as any).id;

  await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json({ message: "Notifications marked as read" });
}
