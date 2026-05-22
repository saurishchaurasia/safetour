const TravelSuggestion = require("../models/TravelSuggestion");
const EmergencyService = require("../models/EmergencyService");
const asyncHandler = require("../utils/asyncHandler");
const { distanceKm } = require("./locationController");
const { recommendationReason } = require("../utils/riskEngine");

const demoSuggestions = [
  { name: "Sunrise Fort Museum", category: "monument", budget: "medium", touristRating: 4.8, googleRating: 4.6, safetyScore: 91, location: { latitude: 28.613, longitude: 77.205 }, estimatedTravelMinutes: 9, description: "Well-lit historic site with verified guides." },
  { name: "SafeBite Riverside Cafe", category: "cafe", budget: "medium", touristRating: 4.6, googleRating: 4.4, safetyScore: 88, location: { latitude: 28.616, longitude: 77.214 }, estimatedTravelMinutes: 12, description: "Popular tourist cafe near patrol route." },
  { name: "Budget Heritage Hotel", category: "hotel", budget: "low", touristRating: 4.2, googleRating: 4.0, safetyScore: 82, location: { latitude: 28.61, longitude: 77.212 }, estimatedTravelMinutes: 14, description: "Verified hotel with 24x7 front desk." },
  { name: "Central ATM Plaza", category: "atm", budget: "low", touristRating: 4.1, googleRating: 4.2, safetyScore: 76, location: { latitude: 28.614, longitude: 77.208 }, estimatedTravelMinutes: 6, description: "ATM cluster in busy public zone." }
];

const getRecommendations = asyncHandler(async (req, res) => {
  let suggestions = await TravelSuggestion.find();
  if (!suggestions.length) suggestions = await TravelSuggestion.insertMany(demoSuggestions);

  const budget = req.query.budget;
  const category = req.query.category;
  const openNow = req.query.openNow === "true";
  const lat = Number(req.query.latitude || 28.6139);
  const lng = Number(req.query.longitude || 77.209);

  const filtered = suggestions
    .filter((item) => !budget || item.budget === budget)
    .filter((item) => !category || item.category === category)
    .filter((item) => !openNow || item.openNow)
    .map((item) => ({
      ...item.toObject(),
      distanceKm: Number(distanceKm({ latitude: lat, longitude: lng }, item.location).toFixed(2)),
      aiReason: recommendationReason(item)
    }))
    .sort((a, b) => b.safetyScore - a.safetyScore || a.distanceKm - b.distanceKm);

  res.json({ recommendations: filtered });
});

const getEmergencyServices = asyncHandler(async (req, res) => {
  let services = await EmergencyService.find();
  if (!services.length) {
    services = await EmergencyService.insertMany([
      { name: "City Care Hospital", type: "hospital", phone: "108", address: "Medical Road", location: { latitude: 28.617, longitude: 77.215 }, etaMinutes: 7 },
      { name: "Central Police Station", type: "police", phone: "100", address: "Central Avenue", location: { latitude: 28.612, longitude: 77.205 }, etaMinutes: 5 },
      { name: "Fire Response Unit", type: "fire", phone: "101", address: "Station Lane", location: { latitude: 28.619, longitude: 77.213 }, etaMinutes: 9 },
      { name: "Safe Shelter Hub", type: "shelter", phone: "112", address: "Tourist Plaza", location: { latitude: 28.611, longitude: 77.211 }, etaMinutes: 6 }
    ]);
  }
  res.json({ services });
});

module.exports = { getRecommendations, getEmergencyServices };
