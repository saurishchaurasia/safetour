const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema({
  emergencyEvent: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyEvent", required: true },
  victim: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  responders: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedAt: { type: Date, default: Date.now },
    etaMinutes: { type: Number, default: 5 }
  }],
  chatEnabled: { type: Boolean, default: true },
  broadcastRadiusMeters: { type: Number, default: 1500 },
  status: { type: String, enum: ["broadcast", "accepted", "closed"], default: "broadcast" }
}, { timestamps: true });

module.exports = mongoose.model("SOSAlert", sosAlertSchema);
