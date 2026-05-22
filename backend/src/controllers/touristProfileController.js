const crypto = require("node:crypto");
const { z } = require("zod");
const TouristProfile = require("../models/TouristProfile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const profileSchema = z.object({
  body: z.object({
    nationality: z.string().min(2).max(80),
    identityType: z.enum(["passport", "aadhaar", "other"]).optional().default("passport"),
    identityNumber: z.string().min(4).max(80),
    bloodGroup: z.string().max(10).optional().default(""),
    hotel: z.object({
      name: z.string().max(120).optional().default(""),
      address: z.string().max(240).optional().default(""),
      phone: z.string().max(24).optional().default("")
    }).optional().default({}),
    itinerary: z.array(z.object({
      place: z.string(),
      city: z.string(),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
      notes: z.string().optional().default("")
    })).optional().default([]),
    travelStart: z.string().datetime(),
    travelEnd: z.string().datetime()
  })
});

function createTouristId() {
  return `TID${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function createBlockchainMock(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

const upsertProfile = asyncHandler(async (req, res) => {
  const existing = await TouristProfile.findOne({ user: req.user._id });
  const touristId = existing?.touristId || createTouristId();
  const qrPayload = JSON.stringify({ touristId, name: req.user.name, validUntil: req.body.travelEnd });
  const blockchainHash = createBlockchainMock({ user: req.user._id, touristId, qrPayload });

  const profile = await TouristProfile.findOneAndUpdate(
    { user: req.user._id },
    { ...req.body, touristId, qrPayload, blockchainHash },
    { upsert: true, new: true, runValidators: true }
  );

  res.json({ profile });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await TouristProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError("Tourist profile not found", 404);
  res.json({ profile });
});

const verifyFaceMock = asyncHandler(async (req, res) => {
  const profile = await TouristProfile.findOneAndUpdate(
    { user: req.user._id },
    { facialVerificationStatus: "mock_verified", trustScore: 92 },
    { new: true }
  );
  if (!profile) throw new AppError("Tourist profile not found", 404);
  res.json({ profile });
});

module.exports = { profileSchema, upsertProfile, getProfile, verifyFaceMock };
