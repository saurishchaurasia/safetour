const SOSAlert = require("../models/SOSAlert");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { emitToAdmins } = require("../services/realtimeService");

const acceptHelp = asyncHandler(async (req, res) => {
  const alert = await SOSAlert.findById(req.params.id);
  if (!alert) throw new AppError("SOS broadcast not found", 404);
  if (!alert.responders.some((item) => item.user.toString() === req.user._id.toString())) {
    alert.responders.push({ user: req.user._id, etaMinutes: 5 });
  }
  alert.status = "accepted";
  await alert.save();
  emitToAdmins("sos:volunteer-accepted", { alertId: alert._id, responder: req.user.name });
  res.json({ alert });
});

module.exports = { acceptHelp };
