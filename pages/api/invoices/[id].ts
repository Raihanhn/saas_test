import Invoice from "@/modules/invoices/invoice.model";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Project from "@/modules/projects/project.model";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).end();

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  const invoice = await Invoice.findById(req.query.id)
    .populate("projectId", "name")
    .populate("clientId", "name email");

  if (!invoice) return res.status(404).end();

  if (role === "client" && invoice.clientId._id.toString() !== userId) {
    return res.status(403).end();
  }

  if (role === "admin" && invoice.adminId.toString() !== userId) {
    return res.status(403).end();
  }

  return res.status(200).json({ invoice });
}
