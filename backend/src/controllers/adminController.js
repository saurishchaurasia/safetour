const User = require("../models/User");
const Alert = require("../models/Alert");
const Location = require("../models/Location");
const EmergencyEvent = require("../models/EmergencyEvent");
const asyncHandler = require("../utils/asyncHandler");

const dashboard = asyncHandler(async (_req, res) => {
  const [users, openEvents, alerts, latestLocations, eventsByStatus] = await Promise.all([
    User.countDocuments({ role: "tourist", isActive: true }),
    EmergencyEvent.countDocuments({ status: { $in: ["open", "acknowledged"] } }),
    Alert.countDocuments({ isActive: true }),
    Location.find().sort({ recordedAt: -1 }).limit(20).populate("user", "name email phone"),
    EmergencyEvent.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  ]);

  res.json({
    metrics: { activeTourists: users, openEvents, activeAlerts: alerts },
    latestLocations,
    eventsByStatus
  });
});

const emergencyEvents = asyncHandler(async (_req, res) => {
  const events = await EmergencyEvent.find().populate("user", "name email phone").sort({ createdAt: -1 }).limit(100);
  res.json({ events });
});

module.exports = { dashboard, emergencyEvents };
