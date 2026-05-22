const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/alertController");

router.use(protect);
router.get("/", controller.listAlerts);
router.get("/nearby", controller.nearbyAlerts);
router.post("/", requireAdmin, validate(controller.alertSchema), controller.createAlert);
router.patch("/:id/deactivate", requireAdmin, controller.deactivateAlert);

module.exports = router;
