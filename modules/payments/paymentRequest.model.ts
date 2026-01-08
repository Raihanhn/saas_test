// modules/payments/paymentRequest.model.ts
import mongoose from "mongoose";

const PaymentRequestSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number }, 
   paymentStatus: { 
    type: String,
    enum: ["none", "requested", "paid"],
    default: "none",
  },
   stripePaymentIntentId: { type: String },
}, { timestamps: true });

export default mongoose.models.PaymentRequest ||
  mongoose.model("PaymentRequest", PaymentRequestSchema);
