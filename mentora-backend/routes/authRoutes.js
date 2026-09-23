import express from "express";
import { register, login } from "../controllers/authController.js";
import { registerRules, loginRules } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);

export default router;
