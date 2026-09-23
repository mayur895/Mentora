import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true },
    type: { type: String, enum: ["1on1", "group", "async"], default: "1on1" },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },
    videoLink: { type: String, default: "" },
    price: { type: Number, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

sessionSchema.index({ mentorId: 1, scheduledAt: 1 });
sessionSchema.index({ studentId: 1, status: 1 });

export default mongoose.model("Session", sessionSchema);
