const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  relationship: { type: String, trim: true, default: "Trusted contact" },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

contactSchema.index({ user: 1, isPrimary: 1 });

module.exports = mongoose.model("Contact", contactSchema);
