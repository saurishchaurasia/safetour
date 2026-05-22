const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/emergencyController");

router.use(protect);
router.post("/sos", validate(controller.sosSchema), controller.triggerSos);
router.get("/mine", controller.listMyEvents);
router.patch("/:id/status", requireAdmin, validate(controller.statusSchema), controller.updateEventStatus);

module.exports = router;
