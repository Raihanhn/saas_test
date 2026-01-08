// modules/clients/client.routes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ClientController } from "@/modules/clients/client.controller";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") return ClientController.createClient(req, res);
  if (req.method === "GET") return ClientController.getClients(req, res);
  return res.status(405).json({ message: "Method not allowed" });
}
