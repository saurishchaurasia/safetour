const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, enum: ["crime", "weather", "crowd", "health", "system"], default: "crime" },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusMeters: { type: Number, default: 1000 }
  },
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

alertSchema.index({ isActive: 1, severity: 1 });

module.exports = mongoose.model("Alert", alertSchema);
