import mongoose from "mongoose";
import Session from "../models/Session.js";
import MentorProfile from "../models/MentorProfile.js";

// @route  POST /api/sessions  (student books a session)
export const createSession = async (req, res) => {
  try {
    const { mentorId, skill, type, scheduledAt, duration, price } = req.body;

    if (!mentorId || !scheduledAt || !duration || price == null) {
      return res.status(400).json({
        message: "Please provide all required session booking fields",
        errors: [{ field: "mentorId", message: "Mentor ID is required" }]
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }

    // mentorId could be a User._id OR a MentorProfile._id — resolve to User._id
    let resolvedMentorUserId = mentorId;
    const profile = await MentorProfile.findById(mentorId).select("userId skills");
    if (profile) {
      // It's a MentorProfile _id — use the linked userId
      if (!profile.userId) {
        return res.status(400).json({ message: "This mentor profile has no linked user account." });
      }
      resolvedMentorUserId = profile.userId;
    }
    // else: mentorId is already a User._id, use as-is

    const sessionSkill = (skill && typeof skill === "string" && skill.trim())
      ? skill.trim()
      : (profile?.skills?.[0] || "General Mentorship");

    const session = await Session.create({
      mentorId: resolvedMentorUserId,
      studentId: req.user._id,
      skill: sessionSkill,
      type: type || "1on1",
      scheduledAt,
      duration,
      price,
      status: "pending"
    });

    res.status(201).json(session);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};


// @route  GET /api/sessions/mine  (sessions for logged-in user, as student or mentor)
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ studentId: req.user._id }, { mentorId: req.user._id }]
    })
      .populate("mentorId", "name avatarUrl")
      .populate("studentId", "name avatarUrl")
      .sort({ scheduledAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PATCH /api/sessions/:id/status  (confirm/cancel/complete)
export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID format" });
    }

    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    const isParticipant =
      session.mentorId.toString() === req.user._id.toString() ||
      session.studentId.toString() === req.user._id.toString();

    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

    session.status = status;
    await session.save();
    res.json(session);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};
