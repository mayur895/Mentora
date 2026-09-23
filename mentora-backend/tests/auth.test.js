import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";

describe("Auth Routes Integration Tests", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mentora_test";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  const testUser = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "Password123!",
    role: "student"
  };

  describe("POST /api/auth/register", () => {
    it("should successfully register a new student user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", testUser.email.toLowerCase());
      expect(res.body.user.role).toEqual("student");
    });

    it("should reject registration with invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Bad Email User",
        email: "notanemail",
        password: "Password123!",
        role: "student"
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should reject registration with duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/Email already in use/i);
    });

    it("should sanitize role 'admin' to 'student'", async () => {
      const adminAttempt = {
        name: "Admin Attacker",
        email: `admin_attempt_${Date.now()}@example.com`,
        password: "Password123!",
        role: "admin"
      };

      const res = await request(app).post("/api/auth/register").send(adminAttempt);

      expect(res.statusCode).toEqual(201);
      expect(res.body.user.role).not.toEqual("admin");
      expect(res.body.user.role).toEqual("student");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should successfully log in an existing user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toEqual(testUser.email.toLowerCase());
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "WrongPassword!"
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });
  });
});
