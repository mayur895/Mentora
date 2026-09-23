// Create admin user
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

// Remove old admin if exists
await User.deleteOne({ email: "admin@mentora.com" });

// Create fresh admin
const admin = await User.create({
  name: "Mentora Admin",
  email: "admin@mentora.com",
  password: "Admin@1234",
  role: "admin"
});

console.log("✅ Admin user created!");
console.log("   ID   :", admin._id.toString());
console.log("   Email: admin@mentora.com");
console.log("   Pass : Admin@1234");
console.log("   Role :", admin.role);

await mongoose.disconnect();
