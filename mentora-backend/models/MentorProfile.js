import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    slots: [{ type: String }] // e.g. "10:00-12:00"
  },
  { _id: false }
);

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, maxlength: 1000 },
    skills: { type: [String], index: true },
    hourlyRate: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    portfolioLinks: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified"
    },
    verificationDocs: [{ type: String }],
    availability: [availabilitySlotSchema],
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    totalSessions: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 }
  },
  { timestamps: true }
);

mentorProfileSchema.index({ "rating.avg": -1 });
mentorProfileSchema.index({ skills: 1, hourlyRate: 1 });

export default mongoose.model("MentorProfile", mentorProfileSchema);
