const DangerZone = require("../models/DangerZone");
const Alert = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");
const { calculateDangerScore, riskColor } = require("../utils/riskEngine");

const demoZones = [
  { _id: "demo-old-market", name: "Old Market Night Risk", category: "crime", color: "orange", historicalIncidentCount: 16, userReportCount: 6, activeSosCount: 1, averageTouristRating: 3.2, location: { latitude: 28.615, longitude: 77.21, radiusMeters: 900 } },
  { _id: "demo-central-heritage", name: "Central Heritage Safe Zone", category: "crowd", color: "green", historicalIncidentCount: 2, userReportCount: 1, activeSosCount: 0, averageTouristRating: 4.7, location: { latitude: 28.613, longitude: 77.204, radiusMeters: 700 } },
  { _id: "demo-service-road", name: "Restricted Service Road", category: "restricted", color: "red", historicalIncidentCount: 22, userReportCount: 10, activeSosCount: 2, averageTouristRating: 2.8, location: { latitude: 28.619, longitude: 77.217, radiusMeters: 650 } }
];

function toHeatmapPoint(zone, demo = false) {
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
    demo,
    factors: {
      userReports: zone.userReportCount,
      touristRating: zone.averageTouristRating,
      sosAlerts: zone.activeSosCount,
      historicalIncidents: zone.historicalIncidentCount
    }
  };
}

const getHeatmap = asyncHandler(async (_req, res) => {
  const zones = await DangerZone.find({ isActive: true }).sort({ updatedAt: -1 });
  const points = zones.length ? zones.map((zone) => toHeatmapPoint(zone)) : demoZones.map((zone) => toHeatmapPoint(zone, true));
  res.json({
    points,
    dataSource: zones.length ? "database" : "demo",
    message: zones.length ? "Heatmap loaded from danger zone records" : "Demo heatmap returned because no danger zone dataset is loaded yet"
  });
});

const seedDemoZones = asyncHandler(async (_req, res) => {
  await DangerZone.deleteMany({});
  await DangerZone.insertMany(demoZones.map(({ _id, ...zone }) => zone));
  await Alert.deleteMany({ category: "crime" });
  await Alert.insertMany(demoZones.map((zone) => ({
    title: zone.name,
    message: "AI geo-fence warning generated from demo danger zone data.",
    category: "crime",
    severity: zone.color === "red" ? "critical" : "high",
    location: zone.location
  })));
  res.json({ message: "Demo heatmap zones seeded", count: demoZones.length });
});

module.exports = { getHeatmap, seedDemoZones };
