import express from "express";
import { createSession, getMySessions, updateSessionStatus } from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createSessionRules } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", protect, createSessionRules, createSession);
router.get("/mine", protect, getMySessions);
router.patch("/:id/status", protect, updateSessionStatus);

export default router;
