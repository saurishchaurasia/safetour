const asyncHandler = require("../utils/asyncHandler");

const {
  loadSouthCrimeDataset,
  SOUTH_BENGALURU_BOUNDS
} = require("../utils/southCrimeData");

// -----------------------------------------------------
// HAVERSINE DISTANCE
// -----------------------------------------------------

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;

  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

function getRiskLevel(score) {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

function calculateDangerScore(crimeType, clusterSize = 1) {
  const severityMap = {
    Murder: 95,
    Rape: 92,
    "Attempted Murder": 88,
    Kidnap: 82,
    Robbery: 72,
    Assault: 65,
    "Chain Snatching": 58,
    "4 Wheeler Theft": 48,
    "2 wheeler theft": 42,
    "Ordinary Theft": 35
  };

  const base = severityMap[crimeType] || 30;

  const densityBoost = Math.min(clusterSize * 2, 25);

  return Math.min(base + densityBoost, 100);
}

function getRecommendation(score) {
  if (score >= 75) {
    return "Avoid isolated areas. Travel in groups and remain highly alert.";
  }

  if (score >= 50) {
    return "Exercise caution especially during evening and night hours.";
  }

  if (score >= 25) {
    return "Stay aware of surroundings and secure valuables.";
  }

  return "Area is relatively safe with normal precautions.";
}

// -----------------------------------------------------
// CLUSTER POINTS
// -----------------------------------------------------

function clusterPoints(records, clusterRadius = 180) {
  const visited = new Array(records.length).fill(false);

  const clusters = [];

  for (let i = 0; i < records.length; i++) {
    if (visited[i]) continue;

    const cluster = [records[i]];

    visited[i] = true;

    for (let j = i + 1; j < records.length; j++) {
      if (visited[j]) continue;

      const dist = haversineMeters(
        records[i].latitude,
        records[i].longitude,
        records[j].latitude,
        records[j].longitude
      );

      if (dist <= clusterRadius) {
        cluster.push(records[j]);
        visited[j] = true;
      }
    }

    const lat =
      cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length;

    const lng =
      cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length;

    const crimeCounts = {};

    cluster.forEach((c) => {
      crimeCounts[c.crimeType] =
        (crimeCounts[c.crimeType] || 0) + 1;
    });

    const dominantCrime = Object.entries(crimeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    const dangerScore = calculateDangerScore(
      dominantCrime,
      cluster.length
    );

    const riskLevel = getRiskLevel(dangerScore);

    const topCrimes = Object.entries(crimeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([crimeType, count]) => ({
        crimeType,
        probability: Math.round((count / cluster.length) * 100),
        count
      }));

    clusters.push({
      id: `cluster-${i}`,

      latitude: lat,
      longitude: lng,

      area: "South Bengaluru",

      dangerScore,
      riskLevel,

      radiusMeters: Math.min(
        300 + cluster.length * 12,
        900
      ),

      totalCrimes: cluster.length,

      dominantCrimeType: dominantCrime,

      topCrimes,

      recommendation: getRecommendation(dangerScore),

      policeStation: "South Division",

      clusterSize: cluster.length,

      isCluster: cluster.length > 1
    });
  }

  return clusters;
}

// -----------------------------------------------------
// GET HEATMAP
// -----------------------------------------------------

const getHeatmap = asyncHandler(async (req, res) => {
  const dataset = loadSouthCrimeDataset();

  if (!dataset || !dataset.records) {
    return res.status(500).json({
      success: false,
      message: "Crime dataset not loaded"
    });
  }

  const records = dataset.records
    .map((r) => ({
      ...r,
      latitude: Number(r.latitude || r.location?.latitude),
      longitude: Number(r.longitude || r.location?.longitude)
    }))
    .filter(
      (r) =>
        Number.isFinite(r.latitude) &&
        Number.isFinite(r.longitude)
    )
    .slice(0, 7000);

  const clustered = clusterPoints(records);

  const avgDangerScore = clustered.length
    ? Math.round(
        clustered.reduce((sum, p) => sum + p.dangerScore, 0) /
          clustered.length
      )
    : 0;

  res.json({
    success: true,

    count: clustered.length,

    avgDangerScore,

    bounds: SOUTH_BENGALURU_BOUNDS,

    points: clustered
  });
});

// -----------------------------------------------------
// ANALYZE AREA
// -----------------------------------------------------

const analyzeArea = asyncHandler(async (req, res) => {
  const { latitude, longitude, radiusMeters = 500 } = req.body;

  const lat = Number(latitude);
  const lng = Number(longitude);

  const dataset = loadSouthCrimeDataset();

  const nearby = dataset.records
    .map((r) => ({
      ...r,
      latitude: Number(r.latitude || r.location?.latitude),
      longitude: Number(r.longitude || r.location?.longitude)
    }))
    .filter((r) => {
      const dist = haversineMeters(
        lat,
        lng,
        r.latitude,
        r.longitude
      );

      return dist <= radiusMeters;
    });

  if (!nearby.length) {
    return res.json({
      success: true,
      analytics: {
        dangerScore: 5,
        riskLevel: "Low",
        totalCrimes: 0,
        topCrimes: [],
        recommendation: "Very little crime reported nearby.",
        hotspotCount: 0,
        peakTime: "Evening",
        nearestStation: "South Division",
        radiusMeters
      }
    });
  }

  const crimeCounts = {};

  nearby.forEach((c) => {
    crimeCounts[c.crimeType] =
      (crimeCounts[c.crimeType] || 0) + 1;
  });

  const dominantCrime = Object.entries(crimeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const dangerScore = calculateDangerScore(
    dominantCrime,
    nearby.length
  );

  const analytics = {
    dangerScore,

    riskLevel: getRiskLevel(dangerScore),

    totalCrimes: nearby.length,

    hotspotCount: Math.max(
      1,
      Math.floor(nearby.length / 8)
    ),

    peakTime:
      dangerScore >= 60
        ? "Night"
        : dangerScore >= 40
        ? "Evening"
        : "Afternoon",

    nearestStation: "South Division",

    radiusMeters,

    recommendation: getRecommendation(dangerScore),

    topCrimes: Object.entries(crimeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([crimeType, count]) => ({
        crimeType,
        count,
        probability: Math.round(
          (count / nearby.length) * 100
        )
      }))
  };

  res.json({
    success: true,
    analytics
  });
});

// -----------------------------------------------------

module.exports = {
  getHeatmap,
  analyzeArea
};