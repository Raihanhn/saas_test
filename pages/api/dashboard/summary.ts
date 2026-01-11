//api/dashboard/summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";

import Invoice from "@/modules/invoices/invoice.model";
import Project from "@/modules/projects/project.model";
import User from "@/core/user/user.model";

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

  try {
    let clientsCount = 0;
    let projectsCount = 0;
    let invoiceCount = 0;
    let totalRevenue = 0;
    const week = Array(7).fill(0);

    // ================= ADMIN =================
    if (role === "admin") {
      const projects = await Project.find({ createdBy: userId }).select("_id");
      const projectIds = projects.map((p) => p._id);

      projectsCount = projectIds.length;

      clientsCount = await User.countDocuments({
        role: "client",
        createdBy: userId,
      });

      const invoices = await Invoice.find({
        projectId: { $in: projectIds },
        paidAt: { $exists: true, $ne: null },
      }).select("amount paidAt");

      invoiceCount = invoices.length;

      invoices.forEach((inv) => {
        const amount = inv.amount || 0;
        totalRevenue += amount;
        const day = new Date(inv.paidAt).getDay();
        week[day] += amount;
      });
    }

    // ================= CLIENT =================
    if (role === "client") {
      const projects = await Project.find({ clientId: userId }).select("_id");
      const projectIds = projects.map((p) => p._id);

      projectsCount = projectIds.length;

      const invoices = await Invoice.find({
        clientId: userId,
        paidAt: { $exists: true, $ne: null },
      }).populate("projectId", "price");

      invoiceCount = invoices.length;

      invoices.forEach((inv) => {
        const amount = inv.amount || inv.projectId?.price || 0;
        totalRevenue += amount;
        const day = new Date(inv.paidAt).getDay();
        week[day] += amount;
      });
    }

    const weeklyRevenue = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (day, index) => ({
        day,
        value: week[index],
      })
    );

    // 🔥 optional cache (Vercel friendly)
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");

    return res.status(200).json({
      invoiceCount,
      clientsCount,
      projectsCount,
      totalRevenue,
      weeklyRevenue,
      type: role === "admin" ? "revenue" : "expense",
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
