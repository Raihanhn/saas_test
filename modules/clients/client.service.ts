//modules/clients/client.service.ts
import User from "@/core/user/user.model";

export const ClientService = {
  async createClient({
    name,
    email,
    password,
    createdBy,
  }: {
    name: string;
    email: string;
    password: string;
    createdBy: string;
  }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error("Email already exists");
    }

    const client = await User.create({
      name,
      email,
      password,
      role: "client",
      createdBy,
    });

    return client;
  },

  async getAllClients(adminId: string) {
    const clients = await User.find({
      role: "client",
      createdBy: adminId,
    }).select("name email createdBy createdAt");

    return clients;
  },

 async updateClient(
  adminId: string,
  clientId: string,
  data: { name?: string; email?: string }
) {
  const client = await User.findOneAndUpdate(
    {
      _id: clientId,
      role: "client",
      createdBy: adminId,
    },
    { $set: data },
    { new: true }
  ).select("name email");

  if (!client) {
    throw new Error("Client not found or access denied");
  }

  return client;
},


 async deleteClient(adminId: string, clientId: string) {
  const client = await User.findOneAndDelete({
    _id: clientId,
    role: "client",
    createdBy: adminId,
  });

  if (!client) {
    throw new Error("Client not found or access denied");
  }

  return true;
}

};
