// pages/api/payments/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import PaymentRequest from "@/modules/payments/paymentRequest.model";
import Invoice from "@/modules/invoices/invoice.model";
import Project from "@/modules/projects/project.model";
import User from "@/core/user/user.model";

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    const body = await buffer(req);
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.log("Webhook fired for PaymentIntent:", intent.id);
    console.log("PaymentIntent metadata:", intent.metadata);

    const paymentRequestId = intent.metadata.paymentRequestId;
    if (!paymentRequestId) {
      console.error(
        "Missing paymentRequestId in metadata for PaymentIntent:",
        intent.id
      );
      return res.status(200).json({ received: true });
    }

    const payment = await PaymentRequest.findById(paymentRequestId);
    if (!payment) {
      console.warn("PaymentRequest not found:", paymentRequestId);
      return res.status(200).json({ received: true });
    }

    payment.paymentStatus = "paid";
    await payment.save();
    console.log("PaymentRequest marked as paid:", payment._id);

    const project = await Project.findById(payment.projectId);
    if (!project) {
      console.warn("Project not found for payment:", payment._id);
      return res.status(200).json({ received: true });
    }

    const client = await User.findById(payment.clientId);
    if (!client) {
      console.warn("Client not found for payment:", payment.clientId);
      return res.status(200).json({ received: true });
    }

    const adminId = client.createdBy || project.createdBy;
    if (!adminId) {
      console.warn(
        "Invoice creation skipped: no adminId found for client:",
        client._id
      );
      return res.status(200).json({ received: true });
    }

    const newInvoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      projectId: project._id,
      clientId: client._id,
      adminId: client.createdBy,
      amount: payment.amount,
      paidAt: new Date(),
    });

    console.log("Invoice created successfully:", newInvoice);
    console.log("Creating invoice with adminId:", client.createdBy);
    console.log(
      "Invoice details -> Client ID:",
      client._id,
      "Admin ID:",
      adminId,
      "Project ID:",
      project._id,
      "Amount:",
      payment.amount
    );
  }

  return res.status(200).json({ received: true });
}
