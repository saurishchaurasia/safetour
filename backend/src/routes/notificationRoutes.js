const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

router.use(protect);
router.post("/send", validate(controller.notificationSchema), controller.sendNotification);

module.exports = router;
