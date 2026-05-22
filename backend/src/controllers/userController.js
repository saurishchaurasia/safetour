const { z } = require("zod");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { publicUser } = require("../utils/tokens");

const profileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().min(7).max(20).optional(),
    tripStatus: z.object({
      sharingEnabled: z.boolean().optional(),
      currentCity: z.string().max(80).optional(),
      checkInEnabled: z.boolean().optional(),
      checkInMinutes: z.number().min(5).max(720).optional()
    }).optional(),
    preferences: z.object({
      darkMode: z.boolean().optional(),
      loudAlarm: z.boolean().optional(),
      pushNotifications: z.boolean().optional()
    }).optional()
  })
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
  res.json({ user: publicUser(user) });
});

const checkIn = asyncHandler(async (req, res) => {
  const dueAt = new Date(Date.now() + (req.user.tripStatus.checkInMinutes || 30) * 60 * 1000);
  req.user.tripStatus.lastCheckInAt = new Date();
  req.user.tripStatus.checkInDueAt = dueAt;
  await req.user.save();
  res.json({ user: publicUser(req.user), dueAt });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map(publicUser) });
});

module.exports = { profileSchema, updateProfile, checkIn, listUsers };
