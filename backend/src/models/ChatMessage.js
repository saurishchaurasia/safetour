const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  intent: { type: String, enum: ["route", "recommendation", "emergency", "law", "scam", "general"], default: "general" }
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
