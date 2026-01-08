// core/adminProfile/adminProfile.model.ts
import mongoose from "mongoose";

export interface IAdminProfile {
  userId: mongoose.Schema.Types.ObjectId;
  businessName: string;
  country: string;
  currency: string;
  timezone: string;
  address: string;
  phone: string;
  website: string;
  logo?: string | null;
  createdAt: Date;
}

const AdminProfileSchema = new mongoose.Schema<IAdminProfile>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  businessName: { type: String, required: true },
  country: { type: String, required: true },
  currency: { type: String, required: true },
  timezone: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String, required: true },
  logo: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AdminProfile ||
  mongoose.model("AdminProfile", AdminProfileSchema);
