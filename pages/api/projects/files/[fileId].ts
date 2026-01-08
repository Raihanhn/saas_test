////pages/api/projects/files/[fileId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import ProjectFile from "@/modules/projects/projectFile.model";
import fs from "fs";
import path from "path";

connectDB();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query;

  if (req.method !== "DELETE")
    return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const role = (session.user as any).role;

  if (role !== "admin") return res.status(403).json({ message: "Admins only" });

  try {
    const file = await ProjectFile.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const filePath = path.join(process.cwd(), "uploads/projects", file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await ProjectFile.findByIdAndDelete(fileId);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
}
