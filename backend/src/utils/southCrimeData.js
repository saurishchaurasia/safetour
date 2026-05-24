const fs = require("node:fs");
const path = require("node:path");

const datasetPath = path.join(__dirname, "..", "data", "crime", "south-bengaluru-crimes.json");

const SOUTH_BENGALURU_BOUNDS = {
  south: 12.75,
  north: 13.10,
  west: 77.45,
  east: 77.80
};

const DEFAULT_RADIUS_METERS = 1200;
const MAX_RADIUS_METERS = 3500;

let cachedDataset = null;

function loadSouthCrimeDataset() {
  if (cachedDataset) return cachedDataset;
  try {
    cachedDataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  } catch (error) {
    console.warn(`[south-crime:data] Failed to load dataset: ${error.message}`);
    cachedDataset = { records: [], clusters: [], quality: { acceptedRecords: 0, rejectedRows: {} }, bounds: SOUTH_BENGALURU_BOUNDS };
  }
  return cachedDataset;
}

function isWithinSouthBengaluru(latitude, longitude) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= SOUTH_BENGALURU_BOUNDS.south
    && latitude <= SOUTH_BENGALURU_BOUNDS.north
    && longitude >= SOUTH_BENGALURU_BOUNDS.west
    && longitude <= SOUTH_BENGALURU_BOUNDS.east;
}

function distanceKm(a, b) {
  const earth = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRadius(radiusMeters) {
  return clamp(Number(radiusMeters) || DEFAULT_RADIUS_METERS, 250, MAX_RADIUS_METERS);
}

function riskLevel(score) {
  if (score >= 85) return "Extreme";
  if (score >= 65) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function safetyRecommendation(score, topCrimes = []) {
  const top = topCrimes[0]?.crimeType || "street crime";
  if (score >= 85) return `Avoid lingering here after dark. Move with trusted transport and keep emergency contacts ready; ${top} is the strongest historical signal nearby.`;
  if (score >= 65) return `Use caution, stay on well-lit roads, and avoid isolated stretches. Historical data suggests ${top} risk nearby.`;
  if (score >= 35) return "Moderate caution advised. Keep valuables secure and prefer busier streets.";
  return "Generally lower historical risk, but keep standard tourist safety habits active.";
}

function toPlainRecord(record) {
  const source = record.toObject ? record.toObject() : record;
  const coordinates = source.location?.coordinates;
  return {
    id: source._id?.toString?.() || source.externalId,
    externalId: source.externalId,
    latitude: source.latitude ?? coordinates?.[1],
    longitude: source.longitude ?? coordinates?.[0],
    crimeType: source.crimeType,
    severity: source.severity || 3,
    area: source.area || "South Bengaluru",
    policeStation: source.policeStation || "Unknown",
    place: source.place || "",
    year: source.year,
    date: source.date || "",
    time: source.time || "",
    timestamp: source.timestamp
  };
}

function filterStaticRecords({ latitude, longitude, radiusMeters, year, crimeType, mode }) {
  const dataset = loadSouthCrimeDataset();
  const center = latitude && longitude ? { latitude, longitude } : null;
  const radiusKm = normalizeRadius(radiusMeters) / 1000;
  return dataset.records.filter((record) => {
    if (year && Number(record.year) !== Number(year)) return false;
    if (crimeType && record.crimeType !== crimeType) return false;
    if (mode === "night") {
      const hour = Number((record.time || "00:00").split(":")[0]);
      if (!(hour >= 19 || hour < 6)) return false;
    }
    if (mode === "day") {
      const hour = Number((record.time || "00:00").split(":")[0]);
      if (hour < 6 || hour >= 19) return false;
    }
    if (!center) return true;
    return distanceKm(center, record) <= radiusKm;
  });
}

function buildAnalytics(records, center = null, radiusMeters = DEFAULT_RADIUS_METERS) {
  const total = records.length;
  const weightedSeverity = records.reduce((sum, record) => sum + (record.severity || 3), 0);
  const crimeCounts = new Map();
  const stationCounts = new Map();
  const areaCounts = new Map();

  for (const record of records) {
    crimeCounts.set(record.crimeType, (crimeCounts.get(record.crimeType) || 0) + 1);
    stationCounts.set(record.policeStation, (stationCounts.get(record.policeStation) || 0) + 1);
    areaCounts.set(record.area, (areaCounts.get(record.area) || 0) + 1);
  }

  const topCrimes = [...crimeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([crimeType, count]) => ({
      crimeType,
      count,
      probability: total ? Math.round((count / total) * 100) : 0
    }));

  const density = total / Math.max(0.25, Math.PI * (normalizeRadius(radiusMeters) / 1000) ** 2);
  const averageSeverity = total ? weightedSeverity / total : 0;
  const dangerScore = clamp(Math.round((density * 4.4) + (averageSeverity * 8.7) + Math.min(20, total / 6)), 0, 100);
  const areaName = [...areaCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "South Bengaluru";
  const nearbyPoliceStation = [...stationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Nearest station unavailable";

  return {
    areaName,
    center,
    radiusMeters: normalizeRadius(radiusMeters),
    dangerScore,
    riskLevel: riskLevel(dangerScore),
    totalCrimes: total,
    averageSeverity: Number(averageSeverity.toFixed(2)),
    densityPerSqKm: Number(density.toFixed(2)),
    topCrimes,
    nearbyPoliceStation,
    recommendation: safetyRecommendation(dangerScore, topCrimes)
  };
}

module.exports = {
  SOUTH_BENGALURU_BOUNDS,
  DEFAULT_RADIUS_METERS,
  MAX_RADIUS_METERS,
  loadSouthCrimeDataset,
  isWithinSouthBengaluru,
  normalizeRadius,
  filterStaticRecords,
  buildAnalytics,
  toPlainRecord
};
