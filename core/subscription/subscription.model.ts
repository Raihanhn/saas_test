// core/subscription/subscription.model.ts
import mongoose from "mongoose";

export interface ISubscription {
  userId: mongoose.Schema.Types.ObjectId;
  plan: "free" | "pro" | "enterprise";
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: "trial" | "active" | "canceled" | "past_due";
  trialEnd?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["free", "pro", "enterprise"], required: true },
  stripeSubscriptionId: { type: String, default: null },
  stripeCustomerId: { type: String, default: null },
  status: {
    type: String,
    enum: ["trial", "active", "canceled", "past_due"],
    default: "trial",
  },
  trialEnd: { type: Date },
  currentPeriodEnd: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
