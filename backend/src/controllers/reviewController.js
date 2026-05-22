const { z } = require("zod");
const Review = require("../models/Review");
const TouristProfile = require("../models/TouristProfile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const reviewSchema = z.object({
  body: z.object({
    placeId: z.string().min(2),
    placeName: z.string().min(2),
    category: z.enum(["monument", "restaurant", "cafe", "hotel", "hospital", "police", "atm", "pharmacy", "attraction"]).optional().default("attraction"),
    safety: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
    crowd: z.number().min(1).max(5),
    scamRisk: z.number().min(1).max(5),
    hospitality: z.number().min(1).max(5),
    comment: z.string().max(1000).optional().default("")
  })
});

function fakeReviewScore(body) {
  const veryShort = body.comment.length < 12 ? 18 : 0;
  const allSame = new Set([body.safety, body.cleanliness, body.crowd, body.scamRisk, body.hospitality]).size === 1 ? 12 : 0;
  return Math.min(100, veryShort + allSame);
}

const createReview = asyncHandler(async (req, res) => {
  const profile = await TouristProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError("Only verified tourists can review places", 403);
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, placeId: req.body.placeId },
    { ...req.body, user: req.user._id, verifiedTourist: true, fakeReviewScore: fakeReviewScore(req.body) },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json({ review });
});

const listReviews = asyncHandler(async (req, res) => {
  const filter = req.query.placeId ? { placeId: req.query.placeId } : {};
  const reviews = await Review.find(filter).populate("user", "name").sort({ createdAt: -1 }).limit(100);
  res.json({ reviews });
});

const reviewStats = asyncHandler(async (_req, res) => {
  const stats = await Review.aggregate([
    { $group: {
      _id: "$placeId",
      placeName: { $first: "$placeName" },
      safetyIndex: { $avg: "$safety" },
      cleanliness: { $avg: "$cleanliness" },
      scamRisk: { $avg: "$scamRisk" },
      count: { $sum: 1 }
    }},
    { $sort: { safetyIndex: -1 } }
  ]);
  res.json({ stats });
});

module.exports = { reviewSchema, createReview, listReviews, reviewStats };
