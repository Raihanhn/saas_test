// pages/api/invoices/pdf/[invoiceId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import Invoice from "@/modules/invoices/invoice.model";
import PDFDocument from "pdfkit";
import Project from "@/modules/projects/project.model";


connectDB();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { invoiceId } = req.query;
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  const invoice = await Invoice.findById(invoiceId)
    .populate("clientId", "name email")
    .populate("projectId", "name price");

  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  if (role === "client" && invoice.clientId._id.toString() !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (role === "admin" && invoice.adminId.toString() !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${invoiceId}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Client Name: ${invoice.clientId.name}`);
  doc.text(`Client Email: ${invoice.clientId.email}`);
  doc.text(`Project Name: ${invoice.projectId.name}`);
  doc.text(`Project Price: $${invoice.projectId.price.toFixed(2)}`);
  doc.text(`Paid At: ${new Date(invoice.paidAt).toLocaleString()}`);

  doc.end();
}
