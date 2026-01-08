// modules/projects/project.model.ts
import mongoose from "mongoose";

export interface IProject {
  name: string;
  description: string;
  status: "TO DO" | "PLANNING" | "IN PROGRESS" | "REVIEW" | "CHANGES REQUIRED" | "COMPLETE" | "CANCELLED"  ;
  clientId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  price: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["TO DO", "PLANNING", "IN PROGRESS", "REVIEW", "CHANGES REQUIRED", "COMPLETE", "CANCELLED"], default: "TO DO" },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
