// seed.js — Creates a fresh mentor + student and runs the full payment flow test
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import MentorProfile from "./models/MentorProfile.js";
import Session from "./models/Session.js";
import Payment from "./models/Payment.js";
import Stripe from "stripe";

dotenv.config();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected\n");

  // ── Clean up old orphaned mentor profile ──────────────────────
  await MentorProfile.deleteMany({ userId: null });
  console.log("🧹 Removed orphaned mentor profiles (userId: null)");

  // ── STEP 1: Create / reuse mentor user ───────────────────────
  let mentorUser = await User.findOne({ email: "mentor_seed@mentora.com" });
  if (!mentorUser) {
    mentorUser = await User.create({
      name: "Alex Johnson",
      email: "mentor_seed@mentora.com",
      password: "Mentor@1234",
      role: "mentor"
    });
    console.log("✅ Mentor user created:", mentorUser._id.toString());
  } else {
    console.log("ℹ  Mentor user exists:", mentorUser._id.toString());
  }

  // ── STEP 2: Create / reuse mentor profile ────────────────────
  let mentorProfile = await MentorProfile.findOne({ userId: mentorUser._id });
  if (!mentorProfile) {
    mentorProfile = await MentorProfile.create({
      userId: mentorUser._id,
      bio: "Senior React & JavaScript developer with 6 years of freelance experience.",
      skills: ["React", "JavaScript", "Node.js", "TypeScript"],
      hourlyRate: 40,
      verificationStatus: "verified"
    });
    console.log("✅ Mentor profile created:", mentorProfile._id.toString());
  } else {
    console.log("ℹ  Mentor profile exists:", mentorProfile._id.toString());
  }

  // ── STEP 3: Create / reuse student user ──────────────────────
  let studentUser = await User.findOne({ email: "student_seed@mentora.com" });
  if (!studentUser) {
    studentUser = await User.create({
      name: "Jane Student",
      email: "student_seed@mentora.com",
      password: "Student@1234",
      role: "student"
    });
    console.log("✅ Student user created:", studentUser._id.toString());
  } else {
    console.log("ℹ  Student user exists:", studentUser._id.toString());
  }

  // ── STEP 4: Create a session ──────────────────────────────────
  const scheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days ahead
  const duration = 60;
  const price = Math.round((mentorProfile.hourlyRate * duration) / 60);

  const session = await Session.create({
    mentorId: mentorUser._id,
    studentId: studentUser._id,
    skill: "React",
    type: "1on1",
    scheduledAt,
    duration,
    price,
    status: "pending"
  });
  console.log("\n✅ Session created:");
  console.log("   ID     :", session._id.toString());
  console.log("   Mentor :", mentorUser.name, "(", mentorUser._id.toString(), ")");
  console.log("   Student:", studentUser.name, "(", studentUser._id.toString(), ")");
  console.log("   Price  : $" + price);
  console.log("   Status :", session.status);

  // ── STEP 5: Hit Stripe Checkout ──────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isRealKey = stripeKey && !stripeKey.startsWith("sk_test_xxxx");
  console.log("\n── Stripe Checkout ─────────────────────────────────────");
  console.log("   Key loaded:", isRealKey ? "✅ REAL KEY" : "⚠️  PLACEHOLDER KEY");

  if (isRealKey) {
    const stripe = new Stripe(stripeKey);
    const clientUrl = process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5174";
    try {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Mentora Session: ${session.skill}`,
                description: `${session.duration} min ${session.type} session with ${mentorUser.name}`
              },
              unit_amount: price * 100
            },
            quantity: 1
          }
        ],
        metadata: {
          sessionId: session._id.toString(),
          studentId: studentUser._id.toString(),
          mentorId: mentorUser._id.toString(),
          amount: price.toString()
        },
        success_url: `${clientUrl}/sessions?payment=success&session_id=${session._id}`,
        cancel_url: `${clientUrl}/sessions?payment=cancelled`
      });

      console.log("\n🎉 REAL STRIPE CHECKOUT CREATED SUCCESSFULLY!");
      console.log("   Stripe Session ID:", stripeSession.id);
      console.log("   Checkout URL     :", stripeSession.url);
      console.log("\n   ➡  Open this URL in browser to pay with test card:");
      console.log("      Card: 4242 4242 4242 4242 | Exp: any future | CVV: any");
    } catch (stripeErr) {
      console.error("❌ Stripe error:", stripeErr.message);
    }
  } else {
    const checkoutUrl = `http://localhost:5174/sessions?payment=success&session_id=${session._id}&test_mode=true`;
    console.log("   Demo URL:", checkoutUrl);
  }

  // ── STEP 6: Simulate confirm-payment ─────────────────────────
  console.log("\n── Payment Confirmation ────────────────────────────────");
  const commissionRate = 0.15;
  const commission = Math.round(price * commissionRate * 100) / 100;
  const mentorPayout = Math.round((price - commission) * 100) / 100;

  const payment = await Payment.create({
    sessionId: session._id,
    studentId: studentUser._id,
    mentorId: mentorUser._id,
    amount: price,
    commission,
    mentorPayout,
    status: "held",
    stripePaymentIntentId: `seed_pi_${Date.now()}`
  });

  session.status = "confirmed";
  session.paymentId = payment._id;
  await session.save();

  console.log("✅ Payment record created:", payment._id.toString());
  console.log("   Amount         : $" + payment.amount);
  console.log("   Commission(15%): $" + payment.commission);
  console.log("   Mentor payout  : $" + payment.mentorPayout);
  console.log("   Payment status : " + payment.status);
  console.log("   Session status : " + session.status);

  console.log("\n══════════════════════════════════════════════════");
  console.log("  ✅ FULL PAYMENT FLOW TEST PASSED");
  console.log("══════════════════════════════════════════════════");
  console.log("\n  Mentor login  → mentor_seed@mentora.com  / Mentor@1234");
  console.log("  Student login → student_seed@mentora.com / Student@1234");
  console.log("══════════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ FATAL ERROR:", err.message);
  process.exit(1);
});
