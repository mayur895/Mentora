import express from "express";
import { createReview, getMentorReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createReviewRules } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", protect, createReviewRules, createReview);
router.get("/mentor/:mentorId", getMentorReviews);

export default router;
