const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/recommendationController");

router.use(protect);
router.get("/", controller.getRecommendations);
router.get("/emergency-services", controller.getEmergencyServices);

module.exports = router;
