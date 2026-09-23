import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, required: true },
    mentorPayout: { type: Number, required: true },
    status: {
      type: String,
      enum: ["held", "released", "refunded"],
      default: "held"
    },
    stripePaymentIntentId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
