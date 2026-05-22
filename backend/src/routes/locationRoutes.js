const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/locationController");

router.use(protect);
router.post("/", validate(controller.locationSchema), controller.updateLocation);
router.get("/latest", controller.latestLocation);
router.get("/history", controller.locationHistory);

module.exports = router;
