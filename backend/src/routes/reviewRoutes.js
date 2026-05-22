const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/reviewController");

router.use(protect);
router.get("/", controller.listReviews);
router.get("/stats", controller.reviewStats);
router.post("/", validate(controller.reviewSchema), controller.createReview);
router.put("/:id", validate(controller.reviewSchema), controller.updateReview);
router.delete("/:id", validate(controller.reviewIdSchema), controller.deleteReview);

module.exports = router;
