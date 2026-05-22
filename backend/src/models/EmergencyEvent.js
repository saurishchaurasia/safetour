const mongoose = require("mongoose");

const emergencyEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["sos", "check_in_timeout", "manual_report"], default: "sos" },
  status: { type: String, enum: ["open", "acknowledged", "resolved", "false_alarm"], default: "open" },
  message: { type: String, default: "" },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: null },
    addressLabel: { type: String, default: "" }
  },
  contactsNotified: [{
    name: String,
    phone: String,
    email: String,
    smsSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false }
  }],
  alarmEnabled: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

emergencyEventSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("EmergencyEvent", emergencyEventSchema);
