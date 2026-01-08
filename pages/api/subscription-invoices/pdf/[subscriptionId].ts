// pages/api/subscription-invoices/pdf/[subscriptionId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Subscription from "@/core/subscription/subscription.model";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

   if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { subscriptionId } = req.query;

    if (
    !subscriptionId ||
    !mongoose.Types.ObjectId.isValid(subscriptionId as string)
  ) {
    return res.status(400).json({ message: "Invalid subscription ID" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const role = (session.user as any).role;
  const adminId = (session.user as any).id;

  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

    await connectDB();

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription)
    return res.status(404).json({ message: "Subscription not found" });

  if (subscription.userId.toString() !== adminId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("Content-Security-Policy", "default-src 'none'");


  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=subscription_${subscriptionId}.pdf`
  );

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
res.setHeader("Pragma", "no-cache");


  doc.pipe(res);

  doc.fontSize(20).text("Subscription Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Admin ID: ${subscription.userId}`);
  doc.text(`Plan: ${subscription.plan}`);
  doc.text(`Status: ${subscription.status}`);
  doc.text(`Created At: ${new Date(subscription.createdAt).toLocaleString()}`);
  if (subscription.status === "trial" && subscription.trialEnd) {
    doc.text(`Trial Ends: ${new Date(subscription.trialEnd).toLocaleString()}`);
  }

  if (subscription.currentPeriodEnd) {
    doc.text(
      `Current Period Ends: ${new Date(
        subscription.currentPeriodEnd
      ).toLocaleString()}`
    );
  }

  doc.end();
}
