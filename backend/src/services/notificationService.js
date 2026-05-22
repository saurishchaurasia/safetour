const nodemailer = require("nodemailer");
const twilio = require("twilio");

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
    console.log(`[email:dry-run] To=${to} Subject=${subject} Text=${text}`);
    return false;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "SafeTrail <alerts@safetrail.local>",
    to,
    subject,
    text
  });
  return true;
}

async function sendSms({ to, body }) {
  const client = getTwilioClient();
  if (!client) {
    console.log(`[sms:dry-run] To=${to} Body=${body}`);
    return false;
  }

  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body
  });
  return true;
}

async function notifyEmergencyContacts(contacts, payload) {
  const results = [];

  for (const contact of contacts) {
    const message = `${payload.userName} triggered SOS at ${payload.locationText}. Map: ${payload.mapUrl}`;
    const [smsSent, emailSent] = await Promise.all([
      sendSms({ to: contact.phone, body: message }).catch(() => false),
      sendEmail({
        to: contact.email,
        subject: "Emergency SOS alert",
        text: `${message}\n\nMessage: ${payload.message || "Immediate assistance requested."}`
      }).catch(() => false)
    ]);

    results.push({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      smsSent,
      emailSent
    });
  }

  return results;
}

module.exports = { sendEmail, sendSms, notifyEmergencyContacts };
