// modules/projects/project.routes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ProjectController } from "./project.controller";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") return ProjectController.createProject(req, res);
  if (req.method === "GET") return ProjectController.getProjects(req, res);
  return res.status(405).json({ message: "Method not allowed" });
}
