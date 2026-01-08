//api/clients/[id].ts
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import { ClientController } from "@/modules/clients/client.controller";

connectDB();

type AuthedRequest = NextApiRequest & { user?: any };

export default withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === "PUT") {
    return ClientController.updateClient(req, res, id as string);
  }

  if (req.method === "DELETE") {
    return ClientController.deleteClient(req, res, id as string);
  }

  return res.status(405).json({ message: "Method not allowed" });
}, { roles: ["admin"] });
