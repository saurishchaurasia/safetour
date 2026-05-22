const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/userController");

router.use(protect);
router.patch("/me", validate(controller.profileSchema), controller.updateProfile);
router.post("/me/check-in", controller.checkIn);
router.get("/", requireAdmin, controller.listUsers);

module.exports = router;
