const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");
const { sendEmail, sendSms } = require("../services/notificationService");

const notificationSchema = z.object({
  body: z.object({
    channel: z.enum(["email", "sms"]),
    to: z.string().min(5),
    subject: z.string().max(120).optional().default("SafeTrail notification"),
    message: z.string().min(2).max(1000)
  })
});

const sendNotification = asyncHandler(async (req, res) => {
  const result = req.body.channel === "sms"
    ? await sendSms({ to: req.body.to, body: req.body.message })
    : await sendEmail({ to: req.body.to, subject: req.body.subject, text: req.body.message });

  res.json({ sent: result.sent, result });
});

module.exports = { notificationSchema, sendNotification };
