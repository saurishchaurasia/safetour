const mongoose = require("mongoose");

const dangerZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  category: { type: String, enum: ["crime", "restricted", "curfew", "crowd", "weather", "border"], default: "crime" },
  color: { type: String, enum: ["green", "yellow", "orange", "red"], default: "yellow" },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusMeters: { type: Number, default: 800 }
  },
  historicalIncidentCount: { type: Number, default: 0 },
  nightRiskMultiplier: { type: Number, default: 1.25 },
  activeSosCount: { type: Number, default: 0 },
  userReportCount: { type: Number, default: 0 },
  averageTouristRating: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("DangerZone", dangerZoneSchema);
