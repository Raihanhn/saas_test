// pages/api/payments/send-request.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import PaymentRequest from "@/modules/payments/paymentRequest.model";
import Notification from "@/modules/notifications/notification.model";
import Project from "@/modules/projects/project.model";
import { sendPaymentEmail } from "@/lib/mailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin")
    return res.status(403).json({ message: "Admins only" });

  const { projectId } = req.body;

  const project = await Project.findById(projectId).populate("clientId");
  if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== session.user.id) {
  return res.status(403).json({ message: "Access denied" });
}

  const paymentRequest = await PaymentRequest.findOne({ projectId });
  if (paymentRequest) {
    paymentRequest.paymentStatus = "requested";
    await paymentRequest.save();
  } else {
    await PaymentRequest.create({
      projectId,
      clientId: project.clientId._id,
      amount: project.price,
      paymentStatus: "requested",
    });
  }

  await Notification.create({
    userId: project.clientId._id,
    title: "Payment Request",
    message: `Payment request sent for project "${project.name}"`,
    projectId: project._id,
    type: "payment",
    isRead: false,
  });

  try {
    await sendPaymentEmail(project.clientId.email, project.name);
  } catch (err) {
    console.error("Failed to send payment email", err);
  }

  return res.status(200).json({ message: "Payment request sent" });
}
