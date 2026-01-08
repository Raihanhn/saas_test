// pages/api/dashboard/revenue.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Invoice from "@/modules/invoices/invoice.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    let invoices: any[] = [];

    if (role === "admin") {
      invoices = await Invoice.find({
        adminId: userId,
        paidAt: { $exists: true, $ne: null },
      });
    }

   if (role === "client") {
  invoices = await Invoice.find({
    clientId: userId,
    paidAt: { $exists: true, $ne: null },
  }).populate("projectId"); 
  console.log("[Revenue API] Client invoices:", JSON.stringify(invoices, null, 2));

}

const total = invoices.reduce((sum, inv) => {
  const price = inv.amount ?? inv.projectId?.price ?? 0;
  console.log(`[Revenue API] invoice ${inv._id} price:`, price);
  return sum + price;
}, 0);

 console.log("[Revenue API] Total amount:", total);


      const week = Array(7).fill(0);
    invoices.forEach((inv) => {
      const day = new Date(inv.paidAt).getDay();
      const amount = inv.amount || inv.projectId?.price || 0;
      week[day] += amount;
      console.log(`[Revenue API] ${new Date(inv.paidAt).toDateString()} => +${amount}`);
    });

    const weekly = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (day, index) => ({
        day,
        value: week[index],
      })
    );

    return res.status(200).json({
      total,
      weekly,
      type: role === "admin" ? "revenue" : "expense",
    });
  } catch (err) {
    console.error("Revenue API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
