// core/user/user.model.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "client";
  createdAt: Date;
  loginToken?: string;
  loginTokenExpiry?: Date;
  createdBy?: mongoose.Schema.Types.ObjectId | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPlan?: "free" | "pro" | "enterprise";
  subscriptionCurrentPeriodEnd?: Date;
  profileImage?: string | null;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  isActive?: boolean;
  hasCompletedSignup?: boolean;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin", "client"], required: true },
  isActive: { type: Boolean, default: true },
  hasCompletedSignup: { type: Boolean, default: false },
   profileImage: { type: String, default: null },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return (this as unknown as IUser).role === "client";
    },
  },
  createdAt: { type: Date, default: Date.now },
  loginToken: { type: String },
  loginTokenExpiry: { type: Date },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  currentPlan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
      default: function(this: IUser) {
    // Only admins get default "free"
    return this.role === "admin" ? "free" : undefined;
  },
  },
   dateOfBirth: { type: Date },
    phone: { type: String },
    address: { type: String },
  subscriptionCurrentPeriodEnd: { type: Date },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
