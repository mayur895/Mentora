import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: function () { return this.authProvider === "local"; } },
    role: { type: String, enum: ["student", "mentor", "admin"], default: "student" },
    authProvider: { type: String, enum: ["local", "google", "linkedin"], default: "local" },
    avatarUrl: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never send password back in responses
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

export default mongoose.model("User", userSchema);
