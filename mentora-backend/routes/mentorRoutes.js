import express from "express";
import {
  getMentors,
  createMentorProfile,
  getMentorById,
  getPendingMentors,
  verifyMentor,
  getMyProfile,
  updateMyProfile
} from "../controllers/mentorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getMentors);
router.post("/", protect, createMentorProfile);
router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, updateMyProfile);
router.get("/admin/pending", protect, getPendingMentors);
router.patch("/:id/verify", protect, verifyMentor);
router.get("/:id", getMentorById);

export default router;
