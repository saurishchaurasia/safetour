function timeOfDayMultiplier(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 22 || hour < 5) return 1.35;
  if (hour >= 18) return 1.15;
  return 1;
}

function calculateDangerScore(zone) {
  const incidentScore = Math.min(35, zone.historicalIncidentCount * 2.2);
  const reportScore = Math.min(25, zone.userReportCount * 3);
  const sosScore = Math.min(25, zone.activeSosCount * 8);
  const ratingPenalty = Math.max(0, 5 - zone.averageTouristRating) * 6;
  const score = (incidentScore + reportScore + sosScore + ratingPenalty) * timeOfDayMultiplier();
  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskColor(score) {
  if (score >= 75) return "red";
  if (score >= 55) return "orange";
  if (score >= 30) return "yellow";
  return "green";
}

function recommendationReason(item) {
  if (item.safetyScore >= 85) return "High safety score and strong tourist trust.";
  if (item.openNow) return "Open now with acceptable safety signals.";
  return "Recommended with caution based on current conditions.";
}

module.exports = { calculateDangerScore, riskColor, recommendationReason };
