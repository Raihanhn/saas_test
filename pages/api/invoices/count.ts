// pages/api/invoices/count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Invoice from "@/modules/invoices/invoice.model";
import Project from "@/modules/projects/project.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let totalInvoices = 0;

  try {
    if (role === "client") {
      totalInvoices = await Invoice.countDocuments({
        clientId: userId,
      });
    }

    if (role === "admin") {
      const projects = await Project.find({ createdBy: userId }).select("_id");

      totalInvoices = await Invoice.countDocuments({
        projectId: { $in: projects.map((p) => p._id) },
      });
    }

    return res.status(200).json({ total: totalInvoices });
  } catch (err) {
    console.error("Invoice count error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
