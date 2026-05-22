const nodemailer = require("nodemailer");
const twilio = require("twilio");
const Notification = require("../models/Notification");

function isDemoMode() {
  return process.env.NOTIFICATION_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
}

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendEmail({ to, subject, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[email:dry-run] Missing SMTP configuration. To=${to} Subject=${subject}`);
    return { sent: false, dryRun: true, channel: "email", to, error: "SMTP configuration is missing" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "SafeTour <alerts@safetour.local>",
      to,
      subject,
      text
    });
    return { sent: true, dryRun: false, channel: "email", to, messageId: info.messageId };
  } catch (error) {
    console.error(`[email:error] To=${to} ${error.message}`);
    return { sent: false, dryRun: false, channel: "email", to, error: error.message };
  }
}

async function sendSms({ to, body }) {
  const client = getTwilioClient();
  if (!client) {
    console.warn(`[sms:dry-run] Missing Twilio configuration. To=${to}`);
    return { sent: false, dryRun: true, channel: "sms", to, error: "Twilio configuration is missing" };
  }

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body
    });
    return { sent: true, dryRun: false, channel: "sms", to, messageId: message.sid };
  } catch (error) {
    console.error(`[sms:error] To=${to} ${error.message}`);
    return { sent: false, dryRun: false, channel: "sms", to, error: error.message };
  }
}

async function writeNotificationLog({ user, title, message, channel, metadata }) {
  try {
    await Notification.create({ user, title, message, channel, metadata });
  } catch (error) {
    console.error(`[notification-log:error] ${error.message}`);
  }
}

async function notifyEmergencyContacts(contacts, payload) {
  const results = [];

  if (!contacts.length) {
    console.warn(`[sos:notification] No emergency contacts configured for user=${payload.userId}`);
    await writeNotificationLog({
      user: payload.userId,
      title: "SOS notification warning",
      message: "SOS was recorded, but no trusted contacts are configured.",
      channel: "system",
      metadata: { type: "sos", reason: "no_contacts" }
    });
    return results;
  }

  for (const contact of contacts) {
    const message = `${payload.userName} triggered SOS at ${payload.locationText}. Map: ${payload.mapUrl}`;
    const [smsSent, emailSent] = await Promise.all([
      sendSms({ to: contact.phone, body: message }),
      sendEmail({
        to: contact.email,
        subject: "Emergency SOS alert",
        text: `${message}\n\nMessage: ${payload.message || "Immediate assistance requested."}`
      })
    ]);

    results.push({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      smsSent: smsSent.sent,
      emailSent: emailSent.sent,
      smsError: smsSent.error || "",
      emailError: emailSent.error || "",
      dryRun: smsSent.dryRun || emailSent.dryRun || isDemoMode()
    });

    await writeNotificationLog({
      user: payload.userId,
      title: "Emergency SOS alert",
      message,
      channel: "system",
      metadata: {
        type: "sos",
        contactId: contact._id,
        sms: smsSent,
        email: emailSent,
        mapUrl: payload.mapUrl
      }
    });
  }

  return results;
}

module.exports = { sendEmail, sendSms, notifyEmergencyContacts, writeNotificationLog };
