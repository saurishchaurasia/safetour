const mongoose = require("mongoose");

const tripCheckInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  enabled: { type: Boolean, default: false },
  intervalMinutes: { type: Number, default: 30, min: 5, max: 720 },
  dueAt: { type: Date, default: null },
  lastConfirmedAt: { type: Date, default: null },
  autoSosTriggered: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("TripCheckIn", tripCheckInSchema);
