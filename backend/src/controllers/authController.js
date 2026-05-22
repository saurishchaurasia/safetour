const crypto = require("node:crypto");
const { z } = require("zod");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, publicUser } = require("../utils/tokens");
const { sendEmail } = require("../services/notificationService");

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().min(7).max(20).optional().default(""),
    password: z.string().min(8)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const forgotSchema = z.object({ body: z.object({ email: z.string().email() }) });
const resetSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password: z.string().min(8)
  })
});

const signup = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError("Email is already registered", 409);

  const user = await User.create(req.body);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+passwordResetToken");
  if (user) {
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.PASSWORD_RESET_URL || "http://localhost:5173/reset-password"}?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "SafeTrail password reset",
      text: `Reset your password using this link: ${resetUrl}`
    });
  }

  res.json({ message: "If the email exists, a reset link has been sent" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select("+passwordResetToken +password");

  if (!user) throw new AppError("Reset token is invalid or expired", 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ token: signToken(user), user: publicUser(user) });
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  signup,
  login,
  me,
  forgotPassword,
  resetPassword
};
