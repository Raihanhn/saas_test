// pages/api/payments/create-payment-intent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import PaymentRequest from "@/modules/payments/paymentRequest.model";
import Project from "@/modules/projects/project.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      console.log("[Stripe] Unauthorized request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectId } = req.body;
    if (!projectId) {
      console.log("[Stripe] ProjectId is missing in request body");
      return res.status(400).json({ message: "ProjectId is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.log(`[Stripe] Project not found for id: ${projectId}`);
      return res.status(404).json({ message: "Project not found" });
    }

        if (session.user.role === "client" && project.clientId.toString() !== session.user.id) {
  return res.status(403).json({ message: "Access denied" });
}

    const amount = project.price
      ? Math.round(Number(project.price) * 100)
      : null;

    if (!amount || amount <= 0) {
      console.log("Invalid project amount:", project.price);
      return res.status(400).json({ message: "Invalid project amount" });
    }

    let paymentRequest = await PaymentRequest.findOne({ projectId });

    if (!paymentRequest) {
      return res.status(400).json({
        message: "Payment request not created by admin yet",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        projectId: project._id.toString(),
        paymentRequestId: paymentRequest._id.toString(),
      },
    });

    console.log(`[Stripe] PaymentIntent created: ${paymentIntent.id}`);

    paymentRequest.stripePaymentIntentId = paymentIntent.id;
    paymentRequest.paymentStatus = "requested";
    await paymentRequest.save();
    console.log(
      `[Stripe] PaymentRequest updated with PaymentIntent ID: ${paymentIntent.id}`
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("[Stripe] Payment Intent Error:", err);
    res.status(500).json({
      message: err.message || "Stripe error",
    });
  }
}
