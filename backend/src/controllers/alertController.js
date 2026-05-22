const { z } = require("zod");
const Alert = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");
const { emitToAdmins, emitToUser } = require("../services/realtimeService");
const { distanceKm } = require("./locationController");

const alertSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    message: z.string().min(5).max(1000),
    category: z.enum(["crime", "weather", "crowd", "health", "system"]).optional().default("crime"),
    severity: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      radiusMeters: z.number().min(50).max(50000).optional().default(1000)
    }),
    expiresAt: z.string().datetime().optional().nullable()
  })
});

const listAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ alerts });
});

const createAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.create({ ...req.body, createdBy: req.user._id });
  emitToAdmins("alert:new", alert);
  res.status(201).json({ alert });
});

const nearbyAlerts = asyncHandler(async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const alerts = await Alert.find({ isActive: true }).sort({ createdAt: -1 });
  const nearby = alerts.filter((alert) => distanceKm({ latitude, longitude }, alert.location) <= alert.location.radiusMeters / 1000);
  res.json({ alerts: nearby });
});

const deactivateAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  emitToAdmins("alert:updated", alert);
  emitToUser(req.user._id, "alert:updated", alert);
  res.json({ alert });
});

module.exports = { alertSchema, listAlerts, createAlert, nearbyAlerts, deactivateAlert };
