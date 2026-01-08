// modules/projects/project.service.ts
import mongoose from "mongoose";
import Project from "./project.model";
import PaymentRequest from "@/modules/payments/paymentRequest.model";

export const ProjectService = {
  async createProject(data: {
    name: string;
    description?: string;
    status?:
      | "TO DO"
      | "PLANNING"
      | "IN PROGRESS"
      | "REVIEW"
      | "CHANGES REQUIRED"
      | "COMPLETE"
      | "CANCELLED";
    clientId: string;
    startDate: Date;
    endDate: Date;
    price?: number;
    createdBy: string;
  }) {
    const project = await Project.create({
      ...data,
      clientId: new mongoose.Types.ObjectId(data.clientId),
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
      price: data.price || 0,
    });

    return project;
  },

  async getAllProjects(userId: string, role: "admin" | "client") {
    let query: any = {};

    if (role === "admin") {
      query.createdBy = new mongoose.Types.ObjectId(userId);
    }

    if (role === "client") {
      query.clientId = new mongoose.Types.ObjectId(userId);
    }

    const projects = await Project.find(query)
      .populate("clientId", "name email")
      .lean();

    const projectsWithPayment = await Promise.all(
      projects.map(async (project) => {
        const paymentRequest = await PaymentRequest.findOne({
          projectId: project._id,
        }).lean();

        return {
          ...project,
          paymentRequest: paymentRequest ?? { paymentStatus: "none" },
        };
      })
    );

    return projectsWithPayment;
  },

  async getProjectById(id: string) {
    const project = await Project.findById(id).populate(
      "clientId",
      "name email"
    );
    if (!project) throw new Error("Project not found");
    return project;
  },

  async updateProject(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      status:
        | "TO DO"
        | "PLANNING"
        | "IN PROGRESS"
        | "REVIEW"
        | "CHANGES REQUIRED"
        | "COMPLETE"
        | "CANCELLED";
      clientId: string;
      startDate: Date;
      endDate: Date;
      price?: number;
    }>
  ) {
    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    if (!project) throw new Error("Project not found");
    return project;
  },

  async deleteProject(id: string) {
    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new Error("Project not found");
    return true;
  },
};
