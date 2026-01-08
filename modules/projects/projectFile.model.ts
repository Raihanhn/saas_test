// modules/projects/projectFile.model.ts
import mongoose from "mongoose";

export interface IProjectFile {
  projectId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  uploaderRole: "admin" | "client";
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  createdAt: Date;
}

const ProjectFileSchema = new mongoose.Schema<IProjectFile>({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploaderRole: { type: String, enum: ["admin", "client"], required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ProjectFile ||
  mongoose.model("ProjectFile", ProjectFileSchema);
