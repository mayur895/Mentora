import mongoose from "mongoose";
import MentorProfile from "./MentorProfile.js";

const reviewSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 }
  },
  { timestamps: true }
);

// Recalculate mentor's average rating whenever a review is added
reviewSchema.post("save", async function (doc) {
  const stats = await mongoose.model("Review").aggregate([
    { $match: { mentorId: doc.mentorId } },
    { $group: { _id: "$mentorId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await MentorProfile.findOneAndUpdate(
      { userId: doc.mentorId },
      { "rating.avg": stats[0].avg.toFixed(2), "rating.count": stats[0].count }
    );
  }
});

export default mongoose.model("Review", reviewSchema);
