import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Valid email address is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  validateRequest
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email address is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest
];

export const createSessionRules = [
  body("mentorId").notEmpty().withMessage("Mentor ID is required"),
  body("skill").trim().notEmpty().withMessage("Skill is required"),
  body("scheduledAt").isISO8601().withMessage("Valid ISO date and time is required"),
  body("duration").isInt({ min: 15 }).withMessage("Duration must be at least 15 minutes"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  validateRequest
];

export const createReviewRules = [
  body("sessionId").notEmpty().withMessage("Session ID is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5 stars"),
  body("comment").optional().isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters"),
  validateRequest
];
