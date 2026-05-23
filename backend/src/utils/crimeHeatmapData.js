const fs = require("node:fs");
const path = require("node:path");

const datasetPath = path.join(__dirname, "..", "data", "crime", "processed-crime-zones.json");

let cachedDataset = null;

function loadCrimeDataset() {
  if (cachedDataset) return cachedDataset;
  try {
    const raw = fs.readFileSync(datasetPath, "utf8");
    cachedDataset = JSON.parse(raw);
  } catch (error) {
    console.warn(`[heatmap:data] Could not load processed crime dataset: ${error.message}`);
    cachedDataset = { zones: [], warnings: [error.message], sourceReports: [] };
  }
  return cachedDataset;
}

function getCrimeDatasetZones() {
  const dataset = loadCrimeDataset();
  return Array.isArray(dataset.zones) ? dataset.zones : [];
}

module.exports = { loadCrimeDataset, getCrimeDatasetZones };
