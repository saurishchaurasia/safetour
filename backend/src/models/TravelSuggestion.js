const mongoose = require("mongoose");

const travelSuggestionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["monument", "restaurant", "cafe", "hospital", "police", "hotel", "atm", "pharmacy", "attraction"], required: true },
  budget: { type: String, enum: ["low", "medium", "premium"], default: "medium" },
  openNow: { type: Boolean, default: true },
  touristRating: { type: Number, min: 1, max: 5, default: 4.2 },
  googleRating: { type: Number, min: 1, max: 5, default: 4.1 },
  safetyScore: { type: Number, min: 0, max: 100, default: 80 },
  photos: [{ type: String }],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  estimatedTravelMinutes: { type: Number, default: 12 },
  description: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("TravelSuggestion", travelSuggestionSchema);
