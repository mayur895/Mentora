import mongoose from "mongoose";
import MentorProfile from "../models/MentorProfile.js";
import User from "../models/User.js";

// @route  GET /api/mentors?skill=React&minRate=10&maxRate=50&sort=rating
export const getMentors = async (req, res) => {
  try {
    const { skill, minRate, maxRate, sort } = req.query;
    const query = { verificationStatus: "verified", userId: { $ne: null } };

    if (skill) query.skills = { $in: [new RegExp(skill, "i")] };
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    let mentorsQuery = MentorProfile.find(query).populate("userId", "name avatarUrl timezone");

    if (sort === "rating") mentorsQuery = mentorsQuery.sort({ "rating.avg": -1 });
    if (sort === "price_low") mentorsQuery = mentorsQuery.sort({ hourlyRate: 1 });
    if (sort === "price_high") mentorsQuery = mentorsQuery.sort({ hourlyRate: -1 });

    const mentors = await mentorsQuery;
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/mentors/my-profile  (mentor views own profile)
export const getMyProfile = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email avatarUrl timezone"
    );
    if (!profile) return res.status(404).json({ message: "No profile found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/mentors/my-profile  (mentor updates own profile)
export const updateMyProfile = async (req, res) => {
  try {
    const { bio, skills, hourlyRate, currency, portfolioLinks } = req.body;

    let profile = await MentorProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // Auto-create if doesn't exist yet
      profile = await MentorProfile.create({
        userId: req.user._id,
        bio,
        skills,
        hourlyRate,
        currency,
        portfolioLinks,
        verificationStatus: "pending"
      });
    } else {
      profile.bio = bio ?? profile.bio;
      profile.skills = skills ?? profile.skills;
      profile.hourlyRate = hourlyRate ?? profile.hourlyRate;
      profile.currency = currency ?? profile.currency;
      profile.portfolioLinks = portfolioLinks ?? profile.portfolioLinks;
      await profile.save();
    }

    const populated = await profile.populate("userId", "name email avatarUrl timezone");
    res.json(populated);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/mentors  (create own mentor profile)
export const createMentorProfile = async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can create a mentor profile" });
    }

    const existing = await MentorProfile.findOne({ userId: req.user._id });
    if (existing) return res.status(400).json({ message: "Profile already exists" });

    const profile = await MentorProfile.create({ ...req.body, userId: req.user._id });
    res.status(201).json(profile);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/mentors/:id
export const getMentorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }
    const mentor = await MentorProfile.findById(req.params.id).populate(
      "userId",
      "name avatarUrl timezone"
    );
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.json(mentor);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/mentors/admin/pending (admin only)
export const getPendingMentors = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const pendingMentors = await MentorProfile.find({ verificationStatus: "pending" })
      .populate("userId", "name email avatarUrl timezone")
      .sort({ createdAt: -1 });

    res.json(pendingMentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PATCH /api/mentors/:id/verify (admin only)
export const verifyMentor = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { verificationStatus } = req.body;
    if (!["verified", "rejected"].includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verificationStatus. Must be 'verified' or 'rejected'" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }

    const profile = await MentorProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    ).populate("userId", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    res.json({ message: `Mentor verification status updated to ${verificationStatus}`, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
