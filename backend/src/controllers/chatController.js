const { z } = require("zod");
const ChatMessage = require("../models/ChatMessage");
const asyncHandler = require("../utils/asyncHandler");

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(2).max(1000)
  })
});

function detectIntent(message) {
  const text = message.toLowerCase();
  if (text.includes("route") || text.includes("safe way")) return "route";
  if (text.includes("hospital") || text.includes("police") || text.includes("nearby")) return "recommendation";
  if (text.includes("sos") || text.includes("emergency")) return "emergency";
  if (text.includes("law") || text.includes("rule")) return "law";
  if (text.includes("scam") || text.includes("fraud")) return "scam";
  return "general";
}

function assistantReply(intent) {
  const replies = {
    route: "Choose main roads, avoid isolated lanes, and follow green or yellow zones on the SafeTour map.",
    recommendation: "I recommend nearby verified hospitals, police stations, pharmacies, and high-safety tourist spots from the recommendations screen.",
    emergency: "Press SOS if you are unsafe. Stay visible, share your location, and move toward the nearest police or shelter marker if possible.",
    law: "Respect local restricted areas, curfew notices, photography bans, and temple attire rules. Ask verified guides when unsure.",
    scam: "Avoid unofficial guides, forced shopping detours, and QR payment pressure. Prefer reviewed places and verified counters.",
    general: "I can help with safe routes, nearby services, scam prevention, emergency guidance, and tourist-friendly recommendations."
  };
  return replies[intent];
}

const sendMessage = asyncHandler(async (req, res) => {
  const intent = detectIntent(req.body.message);
  const userMessage = await ChatMessage.create({ user: req.user._id, role: "user", content: req.body.message, intent });
  const assistantMessage = await ChatMessage.create({ user: req.user._id, role: "assistant", content: assistantReply(intent), intent });
  res.json({ messages: [userMessage, assistantMessage], placeholder: "OpenAI API integration point" });
});

const history = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(50);
  res.json({ messages });
});

module.exports = { chatSchema, sendMessage, history };
