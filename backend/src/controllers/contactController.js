const { z } = require("zod");
const Contact = require("../models/Contact");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().min(7).max(20),
    email: z.string().email(),
    relationship: z.string().max(60).optional().default("Trusted contact"),
    isPrimary: z.boolean().optional().default(false)
  })
});

const contactUpdateSchema = z.object({
  body: contactSchema.shape.body.partial()
});

async function clearPrimary(userId) {
  await Contact.updateMany({ user: userId }, { isPrimary: false });
}

const listContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id }).sort({ isPrimary: -1, createdAt: -1 });
  res.json({ contacts });
});

const createContact = asyncHandler(async (req, res) => {
  if (req.body.isPrimary) await clearPrimary(req.user._id);
  const contact = await Contact.create({ ...req.body, user: req.user._id });
  res.status(201).json({ contact });
});

const updateContact = asyncHandler(async (req, res) => {
  if (req.body.isPrimary) await clearPrimary(req.user._id);
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!contact) throw new AppError("Contact not found", 404);
  res.json({ contact });
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!contact) throw new AppError("Contact not found", 404);
  res.status(204).send();
});

module.exports = { contactSchema, contactUpdateSchema, listContacts, createContact, updateContact, deleteContact };
