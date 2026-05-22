const mongoose = require("mongoose");

const emergencyServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["hospital", "police", "fire", "ambulance", "shelter", "pharmacy"], required: true },
  phone: { type: String, default: "" },
  openNow: { type: Boolean, default: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  address: { type: String, default: "" },
  etaMinutes: { type: Number, default: 8 }
}, { timestamps: true });

module.exports = mongoose.model("EmergencyService", emergencyServiceSchema);
