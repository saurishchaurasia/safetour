const router = require("express").Router();

const {
  protect,
  requireAdmin
} = require("../middleware/authMiddleware");

const controller = require("../controllers/heatmapController");

router.get("/", controller.getHeatmap);

router.post("/analyze", controller.analyzeArea);

router.post(
  "/seed-demo",
  protect,
  requireAdmin,
  controller.seedDemoZones
);

module.exports = router;