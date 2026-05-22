const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/sosNetworkController");

router.use(protect);
router.post("/:id/accept", controller.acceptHelp);

module.exports = router;
