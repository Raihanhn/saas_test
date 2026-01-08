// pages/api/invoices/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Invoice from "@/modules/invoices/invoice.model";
import Project from "@/modules/projects/project.model";
import { withAuth } from "@/lib/middleware/withAuth";


connectDB();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[/api/invoices] Request method:", req.method);

  if (req.method !== "GET") {
    console.log("[/api/invoices] Method not allowed:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      console.log("[/api/invoices] Unauthorized access attempt");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    console.log("[/api/invoices] User role:", role, "User ID:", userId);

    let invoices: any[] = [];

    if (role === "admin") {
      console.log("[/api/invoices] Fetching all invoices for admin...");
      invoices = await Invoice.find({ adminId: userId })
        .populate("clientId", "name email")
        .populate("projectId", "name price")
        .sort({ paidAt: -1 })
        .lean();
    } else {
      console.log("[/api/invoices] Fetching invoices for client only...");
      invoices = await Invoice.find({ clientId: userId })
        .populate("clientId", "name email")
        .populate("projectId", "name price")
        .sort({ paidAt: -1 })
        .lean();
    }

    console.log("[/api/invoices] Fetched invoices count:", invoices.length);

    return res.status(200).json({ invoices });
  } catch (err: any) {
    console.error("[/api/invoices] Error fetching invoices:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
}


