const DangerZone = require("../models/DangerZone");
const Alert = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");
const { calculateDangerScore, riskColor } = require("../utils/riskEngine");

const getHeatmap = asyncHandler(async (_req, res) => {
  const zones = await DangerZone.find({ isActive: true }).sort({ updatedAt: -1 });
  const points = zones.map((zone) => {
    const dangerScore = calculateDangerScore(zone);
    return {
      id: zone._id,
      name: zone.name,
      category: zone.category,
      latitude: zone.location.latitude,
      longitude: zone.location.longitude,
      radiusMeters: zone.location.radiusMeters,
      dangerScore,
      riskPercentage: dangerScore,
      color: riskColor(dangerScore),
      factors: {
        userReports: zone.userReportCount,
        touristRating: zone.averageTouristRating,
        sosAlerts: zone.activeSosCount,
        historicalIncidents: zone.historicalIncidentCount
      }
    };
  });
  res.json({ points });
});

const seedDemoZones = asyncHandler(async (_req, res) => {
  const demo = [
    { name: "Old Market Night Risk", category: "crime", color: "orange", historicalIncidentCount: 16, userReportCount: 6, activeSosCount: 1, averageTouristRating: 3.2, location: { latitude: 28.615, longitude: 77.21, radiusMeters: 900 } },
    { name: "Central Heritage Safe Zone", category: "crowd", color: "green", historicalIncidentCount: 2, userReportCount: 1, activeSosCount: 0, averageTouristRating: 4.7, location: { latitude: 28.613, longitude: 77.204, radiusMeters: 700 } },
    { name: "Restricted Service Road", category: "restricted", color: "red", historicalIncidentCount: 22, userReportCount: 10, activeSosCount: 2, averageTouristRating: 2.8, location: { latitude: 28.619, longitude: 77.217, radiusMeters: 650 } }
  ];
  await DangerZone.deleteMany({});
  await DangerZone.insertMany(demo);
  await Alert.deleteMany({ category: "crime" });
  await Alert.insertMany(demo.map((zone) => ({
    title: zone.name,
    message: "AI geo-fence warning generated from demo danger zone data.",
    category: "crime",
    severity: zone.color === "red" ? "critical" : "high",
    location: zone.location
  })));
  res.json({ message: "Demo heatmap zones seeded", count: demo.length });
});

module.exports = { getHeatmap, seedDemoZones };
