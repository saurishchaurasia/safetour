const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  accuracy: { type: Number, default: null },
  speed: { type: Number, default: null },
  heading: { type: Number, default: null },
  addressLabel: { type: String, default: "" },
  source: { type: String, enum: ["gps", "manual", "simulation"], default: "gps" },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

locationSchema.index({ user: 1, recordedAt: -1 });
locationSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("Location", locationSchema);
