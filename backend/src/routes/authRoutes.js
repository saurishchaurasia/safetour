const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/authController");

router.post("/signup", validate(controller.signupSchema), controller.signup);
router.post("/login", validate(controller.loginSchema), controller.login);
router.get("/me", protect, controller.me);
router.post("/forgot-password", validate(controller.forgotSchema), controller.forgotPassword);
router.post("/reset-password", validate(controller.resetSchema), controller.resetPassword);

module.exports = router;
