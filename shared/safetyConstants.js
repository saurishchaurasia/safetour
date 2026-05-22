const RISK_COLORS = {
  green: { label: "Safe", min: 0, max: 29 },
  yellow: { label: "Moderate Risk", min: 30, max: 54 },
  orange: { label: "Unsafe at Night", min: 55, max: 74 },
  red: { label: "High Crime / Emergency Area", min: 75, max: 100 }
};

const EMERGENCY_TYPES = ["hospital", "police", "fire", "ambulance", "shelter", "pharmacy"];

module.exports = { RISK_COLORS, EMERGENCY_TYPES };
