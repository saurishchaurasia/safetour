const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ["push", "email", "sms", "system"], default: "system" },
  readAt: { type: Date, default: null },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
