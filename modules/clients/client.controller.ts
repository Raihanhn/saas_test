//modules/clients/client.controller.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ClientService } from "@/modules/clients/client.service";

export const ClientController = {
  async createClient(req: any, res: any) {
    const adminId = req.user.id;

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Weak password" });
    }

    const client = await ClientService.createClient({
      name,
      email,
      password,
      createdBy: adminId,
    });

    res.status(201).json({ client });
  },

  async getClients(req: any, res: any) {
    const clients = await ClientService.getAllClients(req.user.id);
    res.status(200).json({ clients });
  },

  async updateClient(req: any, res: any, id: string) {
    const client = await ClientService.updateClient(
      req.user.id,
      id,
      req.body
    );
    res.status(200).json({ client });
  },

  async deleteClient(req: any, res: any, id: string) {
    await ClientService.deleteClient(req.user.id, id);
    res.status(200).json({ message: "Client deleted" });
  },
};

