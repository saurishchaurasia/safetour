const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/contactController");

router.use(protect);
router.get("/", controller.listContacts);
router.post("/", validate(controller.contactSchema), controller.createContact);
router.patch("/:id", validate(controller.contactUpdateSchema), controller.updateContact);
router.delete("/:id", controller.deleteContact);

module.exports = router;
