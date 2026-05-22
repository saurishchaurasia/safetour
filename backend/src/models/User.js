const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: "" },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["tourist", "admin"], default: "tourist" },
  isActive: { type: Boolean, default: true },
  tripStatus: {
    sharingEnabled: { type: Boolean, default: false },
    currentCity: { type: String, default: "" },
    checkInEnabled: { type: Boolean, default: false },
    checkInMinutes: { type: Number, default: 30 },
    checkInDueAt: { type: Date, default: null },
    lastCheckInAt: { type: Date, default: null }
  },
  preferences: {
    darkMode: { type: Boolean, default: false },
    loudAlarm: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false }
}, { timestamps: true });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
