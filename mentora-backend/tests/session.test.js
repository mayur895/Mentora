import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Session from "../models/Session.js";

describe("Session Routes Integration Tests", () => {
  let token;
  let userId;
  let mentorUserId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mentora_test";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const studentRes = await request(app).post("/api/auth/register").send({
      name: "Session Student",
      email: `student_${Date.now()}@example.com`,
      password: "Password123!",
      role: "student"
    });
    token = studentRes.body.token;
    userId = studentRes.body.user._id;

    const mentorRes = await request(app).post("/api/auth/register").send({
      name: "Session Mentor User",
      email: `mentor_${Date.now()}@example.com`,
      password: "Password123!",
      role: "mentor"
    });
    mentorUserId = mentorRes.body.user._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /student_.*|mentor_.*/ });
    await Session.deleteMany({ studentId: userId });
    await mongoose.connection.close();
  });

  describe("POST /api/sessions", () => {
    it("should reject booking without authorization token", async () => {
      const res = await request(app).post("/api/sessions").send({
        mentorId: mentorUserId,
        skill: "React",
        type: "1on1",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        price: 50
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/Not authorized/i);
    });

    it("should reject booking with duration less than 15 minutes", async () => {
      const res = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          mentorId: mentorUserId,
          skill: "React",
          type: "1on1",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          duration: 10,
          price: 50
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should successfully create a pending session when valid data is provided", async () => {
      const res = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          mentorId: mentorUserId,
          skill: "React & Node.js",
          type: "1on1",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          duration: 60,
          price: 75
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.status).toEqual("pending");
      expect(res.body.skill).toEqual("React & Node.js");
    });
  });
});
