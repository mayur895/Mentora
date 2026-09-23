import mongoose from "mongoose";

const stepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    skill: { type: String, required: true },
    sessionType: { type: String, enum: ["1on1", "group", "async"], default: "1on1" },
    order: { type: Number, required: true }
  },
  { _id: false }
);

const learningPathSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    steps: [stepSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("LearningPath", learningPathSchema);
