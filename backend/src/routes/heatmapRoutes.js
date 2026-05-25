const express = require("express");

const router = express.Router();

const {
  getHeatmap,
  analyzeArea
} = require("../controllers/heatmapController");

// GET ALL HEATMAP DATA
router.get("/", getHeatmap);

// ANALYZE CLICKED AREA
router.post("/analyze", analyzeArea);

module.exports = router;