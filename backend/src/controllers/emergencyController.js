const { z } = require("zod");
const Contact = require("../models/Contact");
const EmergencyEvent = require("../models/EmergencyEvent");
const SOSAlert = require("../models/SOSAlert");
const asyncHandler = require("../utils/asyncHandler");
const { notifyEmergencyContacts } = require("../services/notificationService");
const { emitToAdmins } = require("../services/realtimeService");

const sosSchema = z.object({
  body: z.object({
    message: z.string().max(500).optional().default("Emergency assistance requested"),
    alarmEnabled: z.boolean().optional().default(false),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().optional().nullable(),
      addressLabel: z.string().max(200).optional().default(""),
      landmark: z.string().max(200).optional().default(""),
      source: z.enum(["gps", "manual", "simulation", "unknown"]).optional().default("unknown")
    })
  })
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(["open", "acknowledged", "resolved", "false_alarm"])
  })
});

const triggerSos = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id }).sort({ isPrimary: -1 });
  const mapUrl = `https://www.google.com/maps?q=${req.body.location.latitude},${req.body.location.longitude}`;
  const location = {
    ...req.body.location,
    mapUrl
  };
  const contactsNotified = await notifyEmergencyContacts(contacts, {
    userId: req.user._id,
    userName: req.user.name,
    locationText: location.addressLabel || location.landmark || `${location.latitude}, ${location.longitude}`,
    mapUrl,
    message: req.body.message
  });

  const event = await EmergencyEvent.create({
    user: req.user._id,
    type: "sos",
    message: req.body.message,
    location,
    contactsNotified,
    alarmEnabled: req.body.alarmEnabled
  });

  const populated = await event.populate("user", "name email phone");
  const sosBroadcast = await SOSAlert.create({ emergencyEvent: event._id, victim: req.user._id });
  emitToAdmins("emergency:new", populated);
  emitToAdmins("sos:broadcast", sosBroadcast);
  res.status(201).json({
    event: populated,
    notificationSummary: {
      contacts: contacts.length,
      delivered: contactsNotified.filter((item) => item.smsSent || item.emailSent).length,
      dryRun: contactsNotified.some((item) => item.dryRun),
      failures: contactsNotified.filter((item) => item.smsError || item.emailError).length
    }
  });
});

const listMyEvents = asyncHandler(async (req, res) => {
  const events = await EmergencyEvent.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ events });
});

const updateEventStatus = asyncHandler(async (req, res) => {
  const event = await EmergencyEvent.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      resolvedAt: ["resolved", "false_alarm"].includes(req.body.status) ? new Date() : null
    },
    { new: true, runValidators: true }
  ).populate("user", "name email phone");
  res.json({ event });
});

module.exports = { sosSchema, statusSchema, triggerSos, listMyEvents, updateEventStatus };
