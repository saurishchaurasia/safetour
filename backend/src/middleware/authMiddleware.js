const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401);
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("+passwordResetToken");

  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }

  req.user = user;
  next();
});

function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }
  next();
}

module.exports = { protect, requireAdmin };
