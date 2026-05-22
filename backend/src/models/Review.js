const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  placeId: { type: String, required: true, index: true },
  placeName: { type: String, required: true },
  category: { type: String, enum: ["monument", "restaurant", "cafe", "hotel", "hospital", "police", "atm", "pharmacy", "attraction"], default: "attraction" },
  safety: { type: Number, min: 1, max: 5, required: true },
  cleanliness: { type: Number, min: 1, max: 5, required: true },
  crowd: { type: Number, min: 1, max: 5, required: true },
  scamRisk: { type: Number, min: 1, max: 5, required: true },
  hospitality: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000, default: "" },
  verifiedTourist: { type: Boolean, default: true },
  fakeReviewScore: { type: Number, min: 0, max: 100, default: 5 }
}, { timestamps: true });

reviewSchema.index({ user: 1, placeId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
