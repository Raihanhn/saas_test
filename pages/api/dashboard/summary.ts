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

    // MONTH (Jan–Dec)
    const monthly = Array(12).fill(0);


      // YEAR (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearlyMap: Record<number, number> = {};

    for (let i = 0; i < 5; i++) {
      yearlyMap[currentYear - i] = 0;
    }

    let invoices: any[] = [];

    // ================= ADMIN =================

     if (role === "admin") {
      const projects = await Project.find({ createdBy: userId }).select("_id");
      const projectIds = projects.map((p) => p._id);

      projectsCount = projectIds.length;

      clientsCount = await User.countDocuments({
        role: "client",
        createdBy: userId,
      });

      invoices = await Invoice.find({
        projectId: { $in: projectIds },
        paidAt: { $exists: true, $ne: null },
      }).select("amount paidAt");
    }


    // ================= CLIENT =================

   if (role === "client") {
      const projects = await Project.find({ clientId: userId }).select("_id");
      projectsCount = projects.length;

      invoices = await Invoice.find({
        clientId: userId,
        paidAt: { $exists: true, $ne: null },
      }).populate("projectId", "price");
    }

    invoiceCount = invoices.length;

    invoices.forEach((inv) => {
      const amount = inv.amount || inv.projectId?.price || 0;
      const date = new Date(inv.paidAt);

      totalRevenue += amount;

      // MONTH
      const monthIndex = date.getMonth(); // 0–11
      monthly[monthIndex] += amount;

      // YEAR
      const year = date.getFullYear();
      if (yearlyMap[year] !== undefined) {
        yearlyMap[year] += amount;
      }
    });

    const monthlyData = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ].map((month, index) => ({
      month,
      value: monthly[index],
    }));

    const yearlyData = Object.keys(yearlyMap)
      .sort()
      .map((year) => ({
        year,
        value: yearlyMap[Number(year)],
      }));

    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");

    return res.status(200).json({
      invoiceCount,
      clientsCount,
      projectsCount,
      totalRevenue,
      monthlyData,
      yearlyData,
      type: role === "admin" ? "revenue" : "expense",
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
