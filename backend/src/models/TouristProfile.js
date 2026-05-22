const mongoose = require("mongoose");

const touristProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  touristId: { type: String, required: true, unique: true, index: true },
  nationality: { type: String, required: true, trim: true },
  identityType: { type: String, enum: ["passport", "aadhaar", "other"], default: "passport" },
  identityNumber: { type: String, required: true, trim: true, select: false },
  bloodGroup: { type: String, trim: true, default: "" },
  hotel: {
    name: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" }
  },
  itinerary: [{
    place: String,
    city: String,
    startsAt: Date,
    endsAt: Date,
    notes: String
  }],
  travelStart: { type: Date, required: true },
  travelEnd: { type: Date, required: true },
  qrPayload: { type: String, default: "" },
  blockchainHash: { type: String, default: "" },
  facialVerificationStatus: { type: String, enum: ["not_started", "mock_verified", "failed"], default: "not_started" },
  trustScore: { type: Number, min: 0, max: 100, default: 80 }
}, { timestamps: true });

touristProfileSchema.virtual("isValidNow").get(function isValidNow() {
  const now = Date.now();
  return this.travelStart.getTime() <= now && this.travelEnd.getTime() >= now;
});

module.exports = mongoose.model("TouristProfile", touristProfileSchema);
