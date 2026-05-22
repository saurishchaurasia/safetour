const { z } = require("zod");
const Location = require("../models/Location");
const Alert = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");
const { emitToAdmins, emitToUser } = require("../services/realtimeService");

const locationSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().optional().nullable(),
    speed: z.number().optional().nullable(),
    heading: z.number().optional().nullable(),
    addressLabel: z.string().max(160).optional().default(""),
    source: z.enum(["gps", "manual", "simulation"]).optional().default("gps")
  })
});

function distanceKm(a, b) {
  const earth = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.create({ ...req.body, user: req.user._id });
  emitToAdmins("location:update", { user: req.user.name, userId: req.user._id, location });

  const alerts = await Alert.find({ isActive: true });
  const nearbyAlerts = alerts.filter((alert) => {
    const km = distanceKm(req.body, alert.location);
    return km <= (alert.location.radiusMeters / 1000);
  });

  if (nearbyAlerts.length) {
    emitToUser(req.user._id, "alert:nearby", nearbyAlerts);
  }

  res.status(201).json({ location, nearbyAlerts });
});

const latestLocation = asyncHandler(async (req, res) => {
  const location = await Location.findOne({ user: req.user._id }).sort({ recordedAt: -1 });
  res.json({ location });
});

const locationHistory = asyncHandler(async (req, res) => {
  const locations = await Location.find({ user: req.user._id }).sort({ recordedAt: -1 }).limit(100);
  res.json({ locations });
});

module.exports = { locationSchema, updateLocation, latestLocation, locationHistory, distanceKm };
