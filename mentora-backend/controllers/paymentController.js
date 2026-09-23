import Stripe from "stripe";
import mongoose from "mongoose";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_test_xxxx")) {
    return null;
  }
  return new Stripe(key);
};

// @route  POST /api/payments/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay for this session" });
    }

    const stripe = getStripe();
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5174")
      .split(",")[0]
      .trim();

    if (!stripe) {
      // Test/Demo fallback mode when no live Stripe key is configured
      const checkoutUrl = `${clientUrl}/sessions?payment=success&session_id=${session._id}&test_mode=true`;
      return res.json({ url: checkoutUrl, isTestMode: true });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Mentora Session: ${session.skill}`,
              description: `${session.duration} min ${session.type} mentorship session`
            },
            unit_amount: Math.round(session.price * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        sessionId: session._id.toString(),
        studentId: session.studentId.toString(),
        mentorId: session.mentorId.toString(),
        amount: session.price.toString()
      },
      success_url: `${clientUrl}/sessions?payment=success&session_id=${session._id}`,
      cancel_url: `${clientUrl}/sessions?payment=cancelled`
    });

    res.json({ url: stripeSession.url, isTestMode: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/payments/confirm-payment
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, paymentIntentId } = req.body;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    let existingPayment = await Payment.findOne({ sessionId });
    if (!existingPayment) {
      const commissionRate = 0.15;
      const commission = Math.round(session.price * commissionRate * 100) / 100;
      const mentorPayout = Math.round((session.price - commission) * 100) / 100;

      existingPayment = await Payment.create({
        sessionId: session._id,
        studentId: session.studentId,
        mentorId: session.mentorId,
        amount: session.price,
        commission,
        mentorPayout,
        status: "held",
        stripePaymentIntentId: paymentIntentId || `test_pi_${Date.now()}`
      });
    }

    session.status = "confirmed";
    session.paymentId = existingPayment._id;
    await session.save();

    res.json({ message: "Payment confirmed and session booked!", session, payment: existingPayment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/payments/webhook
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const stripe = getStripe();

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(200).json({ received: true, note: "Webhook simulated" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const stripeSession = event.data.object;
    const { sessionId, studentId, mentorId, amount } = stripeSession.metadata;

    const numAmount = Number(amount);
    const commission = Math.round(numAmount * 0.15 * 100) / 100;
    const mentorPayout = Math.round((numAmount - commission) * 100) / 100;

    const payment = await Payment.create({
      sessionId,
      studentId,
      mentorId,
      amount: numAmount,
      commission,
      mentorPayout,
      status: "held",
      stripePaymentIntentId: stripeSession.payment_intent || stripeSession.id
    });

    await Session.findByIdAndUpdate(sessionId, {
      status: "confirmed",
      paymentId: payment._id
    });
  }

  res.json({ received: true });
};
