const router = require("express").Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/heatmapController");

router.use(protect);
router.get("/", controller.getHeatmap);
router.post("/seed-demo", requireAdmin, controller.seedDemoZones);

module.exports = router;
