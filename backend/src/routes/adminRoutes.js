const router = require("express").Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/adminController");

router.use(protect, requireAdmin);
router.get("/dashboard", controller.dashboard);
router.get("/emergencies", controller.emergencyEvents);

module.exports = router;
