const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/touristProfileController");

router.use(protect);
router.get("/me", controller.getProfile);
router.put("/me", validate(controller.profileSchema), controller.upsertProfile);
router.post("/me/facial-verification", controller.verifyFaceMock);

module.exports = router;
