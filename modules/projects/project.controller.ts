// modules/projects/project.controller.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ProjectService } from "./project.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const ProjectController = {
  async createProject(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST")
      return res.status(405).json({ message: "Method not allowed" });

    try {
      const session = await getServerSession(req, res, authOptions);

      console.log("Current session:", session);

      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if ((session.user as any).role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
      }

      const adminId = (session.user as any).id;

      const { name, description, status, clientId, startDate, endDate, price } =
        req.body;
      if (!name || !clientId || !startDate || !endDate) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const project = await ProjectService.createProject({
        name,
        description,
        status,
        clientId,
        startDate,
        endDate,
        price,
        createdBy: adminId,
      });

      return res
        .status(201)
        .json({ message: "Project created successfully", project });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async getProjects(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
      return res.status(405).json({ message: "Method not allowed" });

    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (session.user as any).id;
      const role = (session.user as any).role;

      const projects = await ProjectService.getAllProjects(userId, role);

      return res.status(200).json({ projects });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async updateProject(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    if ((session.user as any).role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }


      const data = req.body;

      console.log("Update request received for project:", id);
      console.log("Data sent from frontend:", data);

      const project = await ProjectService.updateProject(id, data);
      return res.status(200).json({ message: "Project updated", project });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async deleteProject(req: NextApiRequest, res: NextApiResponse, id: string) {
    try {

      const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    if ((session.user as any).role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

      await ProjectService.deleteProject(id);
      return res.status(200).json({ message: "Project deleted" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  },
};
