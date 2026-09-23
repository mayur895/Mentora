import express from "express";
import {
  createCheckoutSession,
  confirmPayment,
  handleStripeWebhook
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/confirm-payment", protect, confirmPayment);
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
