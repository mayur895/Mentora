import mongoose from "mongoose";
import Review from "../models/Review.js";
import Session from "../models/Session.js";
import MentorProfile from "../models/MentorProfile.js";

// @route  POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    if (!sessionId || !rating) {
      return res.status(400).json({ message: "Session ID and rating (1-5) are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID format" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the student who attended this session can leave a review" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Reviews can only be submitted for completed sessions" });
    }

    const existingReview = await Review.findOne({ sessionId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already submitted a review for this session" });
    }

    const review = await Review.create({
      sessionId,
      studentId: req.user._id,
      mentorId: session.mentorId,
      rating: numRating,
      comment: comment || ""
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/reviews/mentor/:mentorId
export const getMentorReviews = async (req, res) => {
  try {
    const { mentorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }

    let targetUserId = mentorId;
    const profile = await MentorProfile.findById(mentorId);
    if (profile) {
      targetUserId = profile.userId;
    }

    const reviews = await Review.find({ mentorId: targetUserId })
      .populate("studentId", "name avatarUrl")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
