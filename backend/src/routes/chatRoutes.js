const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/chatController");

router.use(protect);
router.get("/", controller.history);
router.post("/", validate(controller.chatSchema), controller.sendMessage);

module.exports = router;
