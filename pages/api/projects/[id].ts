//pages/api/projects/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { ProjectController } from "@/modules/projects/project.controller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import multer from "multer";
import path from "path";
import fs from "fs";
import ProjectFile from "@/modules/projects/projectFile.model";
import PaymentRequest from "@/modules/payments/paymentRequest.model";
import Project from "@/modules/projects/project.model";

connectDB();

// const uploadDir = path.join(process.cwd(), "uploads/projects");
const uploadDir = "/tmp/uploads/projects";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 },
});

export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, action } = req.query;

  if (action === "files") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user)
      return res.status(401).json({ message: "Unauthorized" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role === "client" && project.clientId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.method === "POST") {
      await new Promise<void>((resolve, reject) => {
        upload.single("file")(req as any, res as any, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const file = (req as any).file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      const saved = await ProjectFile.create({
        projectId: id,
        uploadedBy: userId,
        uploaderRole: role,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        path: file.path,
      });

      return res.status(201).json({ message: "File uploaded", file: saved });
    }

    if (req.method === "GET") {
      const files = await ProjectFile.find({ projectId: id }).sort({
        createdAt: -1,
      });
      return res.status(200).json({ files });
    }

    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!action && req.method === "GET") {

    const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

    try {
      const project = await Project.findById(id)
        .populate("clientId", "name email")
        .lean();
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const paymentRequest = await PaymentRequest.findOne({
        projectId: id,
      }).lean();
      return res.status(200).json({
        project: {
          ...project,
          paymentRequest: paymentRequest
            ? paymentRequest
            : { paymentStatus: "none" },
        },
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  }

  if (req.method === "PUT" || req.method === "DELETE") {

    const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

  if ((session.user as any).role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }


    if (req.method === "PUT") {
      try {
        const raw = await new Promise<string>((resolve, reject) => {
          let data = "";
          req.on("data", (chunk) => (data += chunk));
          req.on("end", () => resolve(data));
          req.on("error", (err) => reject(err));
        });
        req.body = JSON.parse(raw);
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON body" });
      }
      return ProjectController.updateProject(req, res, id as string);
    }

    if (req.method === "DELETE") {
      return ProjectController.deleteProject(req, res, id as string);
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
