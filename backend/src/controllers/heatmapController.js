const DangerZone = require("../models/DangerZone");
const Alert = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");
const { calculateDangerScore, riskColor } = require("../utils/riskEngine");

const {
  loadSouthCrimeDataset,
  filterStaticRecords,
  buildAnalytics,
  isWithinSouthBengaluru
} = require("../utils/southCrimeData");

const demoZones = [
  {
    _id: "demo-old-market",
    name: "Old Market Night Risk",
    category: "crime",
    color: "orange",
    historicalIncidentCount: 16,
    userReportCount: 6,
    activeSosCount: 1,
    averageTouristRating: 3.2,
    location: {
      latitude: 28.615,
      longitude: 77.21,
      radiusMeters: 900
    }
  },
  {
    _id: "demo-central-heritage",
    name: "Central Heritage Safe Zone",
    category: "crowd",
    color: "green",
    historicalIncidentCount: 2,
    userReportCount: 1,
    activeSosCount: 0,
    averageTouristRating: 4.7,
    location: {
      latitude: 28.613,
      longitude: 77.204,
      radiusMeters: 700
    }
  },
  {
    _id: "demo-service-road",
    name: "Restricted Service Road",
    category: "restricted",
    color: "red",
    historicalIncidentCount: 22,
    userReportCount: 10,
    activeSosCount: 2,
    averageTouristRating: 2.8,
    location: {
      latitude: 28.619,
      longitude: 77.217,
      radiusMeters: 650
    }
  }
];

function toHeatmapPoint(point) {
  return {
    id: point.id || point._id,

    latitude: point.latitude,
    longitude: point.longitude,

    radiusMeters: point.radiusMeters || 800,

    dangerScore: point.dangerScore || 0,

    riskLevel: point.riskLevel || "Medium",

    totalCrimes: point.totalCrimes || 0,

    topCrimes: point.topCrimes || [],

    recommendation:
      point.recommendation
      || "Stay alert and avoid isolated roads.",

    crimeType:
      point.crimeType
      || "General Crime",

    color:
      point.dangerScore >= 80
        ? "red"
        : point.dangerScore >= 60
        ? "orange"
        : point.dangerScore >= 35
        ? "yellow"
        : "green"
  };
}

const getHeatmap = asyncHandler(async (_req, res) => {
  const dataset = loadSouthCrimeDataset();

  if (dataset.records?.length) {
    const points = dataset.records.slice(0, 3000).map((record, index) => ({
      id: record.externalId || `crime-${index}`,
      latitude: record.latitude,
      longitude: record.longitude,
      dangerScore: Math.min(100, (record.severity || 3) * 20),
      riskPercentage: Math.min(100, (record.severity || 3) * 20),
      crimeType: record.crimeType,
      area: record.area,
      policeStation: record.policeStation,
      color:
        (record.severity || 3) >= 4
          ? "red"
          : (record.severity || 3) >= 3
          ? "orange"
          : "yellow",
      radiusMeters: 120
    }));

    return res.json({
      points,
      dataSource: "south-bengaluru-crime-dataset",
      totalRecords: dataset.records.length,
      bounds: dataset.bounds
    });
  }

  const zones = await DangerZone.find({ isActive: true }).sort({
    updatedAt: -1
  });

  const points = zones.length
    ? zones.map((zone) => toHeatmapPoint(zone))
    : demoZones.map((zone) => toHeatmapPoint(zone, true));

  res.json({
    points,
    dataSource: zones.length ? "database" : "demo",
    message: zones.length
      ? "Heatmap loaded from danger zone records"
      : "Demo heatmap returned because no danger zone dataset is loaded yet"
  });
});

const analyzeArea = asyncHandler(async (req, res) => {
  const {
    latitude,
    longitude,
    radiusMeters,
    mode,
    crimeType,
    year
  } = req.body;

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({
      message: "Valid latitude and longitude are required"
    });
  }

  if (!isWithinSouthBengaluru(lat, lng)) {
    return res.status(400).json({
      message: "Location is outside supported South Bengaluru region"
    });
  }

  const nearbyRecords = filterStaticRecords({
    latitude: lat,
    longitude: lng,
    radiusMeters,
    mode,
    crimeType,
    year
  });

  const analytics = buildAnalytics(
    nearbyRecords,
    { latitude: lat, longitude: lng },
    radiusMeters
  );

  res.json({
    success: true,
    analytics,
    nearbyCrimes: nearbyRecords.slice(0, 25)
  });
});

const seedDemoZones = asyncHandler(async (_req, res) => {
  await DangerZone.deleteMany({});

  await DangerZone.insertMany(
    demoZones.map(({ _id, ...zone }) => zone)
  );

  await Alert.deleteMany({ category: "crime" });

  await Alert.insertMany(
    demoZones.map((zone) => ({
      title: zone.name,
      message:
        "AI geo-fence warning generated from demo danger zone data.",
      category: "crime",
      severity: zone.color === "red" ? "critical" : "high",
      location: zone.location
    }))
  );

  res.json({
    message: "Demo heatmap zones seeded",
    count: demoZones.length
  });
});

module.exports = {
  getHeatmap,
  analyzeArea,
  seedDemoZones
};