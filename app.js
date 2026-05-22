const tourist = {
  name: "Aarav Mehta",
  id: "TRV-2049",
  emergencyContact: "+91 90000 11111"
};

const routePoints = [
  { label: "City Museum", x: 62, y: 28 },
  { label: "Heritage Gate", x: 18, y: 22 },
  { label: "Central Plaza approach", x: 44, y: 55 },
  { label: "Central Plaza inner lane", x: 49, y: 52 },
  { label: "Night Market Cafe", x: 35, y: 72 },
  { label: "Riverside Walk", x: 78, y: 49 }
];

const dangerZones = [
  {
    id: "plaza-theft",
    name: "Central Plaza Pickpocket Zone",
    type: "Accident-prone / theft reports",
    x: 48,
    y: 54,
    radius: 13,
    risk: "high",
    advice: "Use the main lit walkway and avoid isolated lanes after sunset."
  },
  {
    id: "market-crowd",
    name: "Night Market Crowd Surge",
    type: "Crowding and harassment reports",
    x: 35,
    y: 73,
    radius: 11,
    risk: "medium",
    advice: "Travel in groups and exit through the northern road."
  },
  {
    id: "restricted-hill",
    name: "Restricted Hill Trail",
    type: "Restricted government / terrain hazard",
    x: 21,
    y: 34,
    radius: 10,
    risk: "medium",
    advice: "Follow marked paths and avoid unverified guides."
  }
];

const places = [
  { id: "fort", name: "Amber Fort View", category: "monument", x: 18, y: 22, google: 4.6, tourist: 4.4, votes: 128, risk: "medium", note: "Historic monument with a nearby police kiosk.", facility: "Temple attire: shoulders covered, comfortable walking shoes recommended." },
  { id: "plaza", name: "Central Plaza", category: "monument", x: 46, y: 55, google: 4.2, tourist: 3.7, votes: 91, risk: "high", note: "Central meeting point with recent pickpocketing reports.", facility: "Restrooms are 180 m east. Avoid low-light side lanes." },
  { id: "museum", name: "City Museum", category: "monument", x: 62, y: 28, google: 4.7, tourist: 4.8, votes: 214, risk: "low", note: "Well-lit exits, verified guides, and accessible entry.", facility: "Wheelchair ramp, drinking water, and medical desk available." },
  { id: "bistro", name: "Riverside Bistro", category: "restaurant", x: 78, y: 49, google: 4.3, tourist: 4.6, votes: 76, risk: "low", note: "Popular restaurant along a safe riverside walk.", facility: "Water refill, accessible seating, and taxi pickup point." },
  { id: "market", name: "Night Market Cafe", category: "restaurant", x: 35, y: 72, google: 4.1, tourist: 3.5, votes: 67, risk: "medium", note: "Busy evening area where crowding can increase.", facility: "Use north gate exit. Restrooms are inside the market block." },
  { id: "water", name: "Water and Restroom Hub", category: "facility", x: 53, y: 62, google: 4.5, tourist: 4.3, votes: 44, risk: "low", note: "Verified basic services for tourists.", facility: "Drinking water, restrooms, mother-care room, and charging point." },
  { id: "trek", name: "Trekking Equipment Desk", category: "facility", x: 24, y: 37, google: 4.0, tourist: 4.2, votes: 31, risk: "medium", note: "Rental point for trail safety equipment.", facility: "Shoes, sticks, first-aid kit, rain cover, and route checklist." },
  { id: "help", name: "Tourist Help Desk", category: "help", x: 54, y: 65, google: 4.8, tourist: 4.9, votes: 52, risk: "low", note: "Authority-backed help point for emergency support.", facility: "Lost documents, emergency calling, guide verification, and transport help." }
];

const crimeReports = [
  { x: 45, y: 57, daysAgo: 3, severity: 5, type: "Theft" },
  { x: 49, y: 51, daysAgo: 12, severity: 4, type: "Harassment" },
  { x: 38, y: 71, daysAgo: 22, severity: 3, type: "Crowding" },
  { x: 31, y: 76, daysAgo: 48, severity: 3, type: "Theft" },
  { x: 17, y: 24, daysAgo: 78, severity: 2, type: "Overcharging" },
  { x: 78, y: 48, daysAgo: 118, severity: 2, type: "Dispute" },
  { x: 24, y: 36, daysAgo: 210, severity: 4, type: "Trail hazard" },
  { x: 67, y: 30, daysAgo: 270, severity: 2, type: "Crowding" }
];

let routeIndex = 2;
let selectedPlaceId = "plaza";
let alertCount = 0;
let lastZoneAlert = "";

const elements = {
  touristName: document.querySelector("#touristName"),
  touristMarker: document.querySelector("#touristMarker"),
  currentLocation: document.querySelector("#currentLocation"),
  gpsStatus: document.querySelector("#gpsStatus"),
  riskLabel: document.querySelector("#riskLabel"),
  adminLocation: document.querySelector("#adminLocation"),
  adminRisk: document.querySelector("#adminRisk"),
  markerLayer: document.querySelector("#markerLayer"),
  heatLayer: document.querySelector("#heatLayer"),
  zoneLayer: document.querySelector("#zoneLayer"),
  placeDetails: document.querySelector("#placeDetails"),
  facilityList: document.querySelector("#facilityList"),
  zoneList: document.querySelector("#zoneList"),
  alertList: document.querySelector("#alertList"),
  categoryFilter: document.querySelector("#categoryFilter"),
  timeframeFilter: document.querySelector("#timeframeFilter"),
  toast: document.querySelector("#toast"),
  openIncidents: document.querySelector("#openIncidents"),
  safeScore: document.querySelector("#safeScore")
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function iconFor(category) {
  if (category === "restaurant") return "R";
  if (category === "facility") return "F";
  if (category === "help") return "+";
  return "M";
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3300);
}

function setMode(mode) {
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  document.querySelector("#touristDashboard").classList.toggle("is-visible", mode === "tourist");
  document.querySelector("#adminDashboard").classList.toggle("is-visible", mode === "admin");
}

function classifyRisk(point) {
  const nearbyZones = dangerZones
    .map((zone) => ({ ...zone, distance: distance(point, zone) }))
    .filter((zone) => zone.distance <= zone.radius)
    .sort((a, b) => a.distance - b.distance);

  if (!nearbyZones.length) {
    return { level: "low", label: "Low", zone: null };
  }

  const hasHigh = nearbyZones.some((zone) => zone.risk === "high");
  return {
    level: hasHigh ? "high" : "medium",
    label: hasHigh ? "High" : "Medium",
    zone: nearbyZones[0]
  };
}

function updateLocation(point, source = "Simulated GPS active") {
  const risk = classifyRisk(point);
  elements.touristMarker.style.setProperty("--x", `${point.x}%`);
  elements.touristMarker.style.setProperty("--y", `${point.y}%`);
  elements.currentLocation.textContent = point.label;
  elements.gpsStatus.textContent = source;
  elements.adminLocation.textContent = point.label;
  elements.adminRisk.textContent = risk.label;
  elements.riskLabel.textContent = risk.label;
  elements.riskLabel.className = `risk ${risk.level}`;

  if (risk.zone && lastZoneAlert !== risk.zone.id) {
    lastZoneAlert = risk.zone.id;
    showToast(`Danger zone warning: ${risk.zone.name}. ${risk.zone.advice}`);
    if (risk.level === "high") {
      addAlert("Automatic geo-fence warning", `${tourist.name} entered ${risk.zone.name}. ${risk.zone.advice}`, true);
    }
  }

  renderFacilities(point);
}

function renderZones() {
  elements.zoneLayer.innerHTML = "";
  dangerZones.forEach((zone) => {
    const marker = document.createElement("div");
    marker.className = "danger-zone";
    marker.style.setProperty("--x", `${zone.x}%`);
    marker.style.setProperty("--y", `${zone.y}%`);
    marker.style.setProperty("--size", `${zone.radius * 7}px`);
    marker.setAttribute("aria-label", zone.name);
    elements.zoneLayer.appendChild(marker);
  });
}

function renderMarkers() {
  const category = elements.categoryFilter.value;
  elements.markerLayer.innerHTML = "";

  places
    .filter((place) => category === "all" || place.category === category)
    .forEach((place) => {
      const marker = document.createElement("button");
      marker.className = "place-marker";
      marker.type = "button";
      marker.dataset.risk = place.risk;
      marker.style.setProperty("--x", `${place.x}%`);
      marker.style.setProperty("--y", `${place.y}%`);
      marker.setAttribute("aria-label", `${place.name}, ${place.category}`);
      marker.textContent = iconFor(place.category);
      if (place.id === selectedPlaceId) marker.classList.add("is-selected");
      marker.addEventListener("click", () => selectPlace(place.id));
      elements.markerLayer.appendChild(marker);
    });
}

function ratingRow(label, value) {
  return `
    <div class="rating-row">
      <strong>${label}</strong>
      <div class="rating-bar"><div class="rating-fill" style="--rating:${(value / 5) * 100}%"></div></div>
      <span>${value.toFixed(1)}</span>
    </div>
  `;
}

function selectPlace(id) {
  selectedPlaceId = id;
  const place = places.find((item) => item.id === id);
  elements.placeDetails.innerHTML = `
    <p class="eyebrow">${place.category}</p>
    <h3>${place.name}</h3>
    <p>${place.note}</p>
    <p><strong>Facility guidance:</strong> ${place.facility}</p>
    <div class="ratings">
      ${ratingRow("Google", place.google)}
      ${ratingRow("Tourists", place.tourist)}
    </div>
    <p>${place.votes} tourist ratings collected on SafeTrail.</p>
    <div class="user-rate" aria-label="Rate this place">
      ${[1, 2, 3, 4, 5].map((score) => `<button type="button" data-score="${score}">${score}</button>`).join("")}
    </div>
  `;

  elements.placeDetails.querySelectorAll("[data-score]").forEach((button) => {
    button.addEventListener("click", () => addTouristRating(place.id, Number(button.dataset.score)));
  });

  renderMarkers();
}

function addTouristRating(id, score) {
  const place = places.find((item) => item.id === id);
  place.tourist = ((place.tourist * place.votes) + score) / (place.votes + 1);
  place.votes += 1;
  selectPlace(id);
  showToast(`Your ${score}/5 tourist rating was added for ${place.name}.`);
}

function renderFacilities(point = routePoints[routeIndex]) {
  const nearby = places
    .filter((place) => ["facility", "help", "monument"].includes(place.category))
    .map((place) => ({ ...place, distance: Math.round(distance(point, place) * 18) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  elements.facilityList.innerHTML = nearby.map((place) => `
    <article class="facility-card">
      <strong>${place.name}<span>${place.distance} m</span></strong>
      <p>${place.facility}</p>
      <p>SafeTrail tourist rating: ${place.tourist.toFixed(1)}/5</p>
    </article>
  `).join("");
}

function renderZoneList() {
  elements.zoneList.innerHTML = dangerZones.map((zone) => `
    <article class="zone-card">
      <strong>${zone.name}<span>${zone.risk.toUpperCase()}</span></strong>
      <p>${zone.type}</p>
      <p>${zone.advice}</p>
    </article>
  `).join("");
}

function renderHeatmap() {
  const timeframe = Number(elements.timeframeFilter.value);
  const halfLife = timeframe / 2;
  elements.heatLayer.innerHTML = "";

  const visibleReports = crimeReports.filter((report) => report.daysAgo <= timeframe);
  const riskTotal = visibleReports.reduce((sum, report) => {
    const decay = Math.pow(0.5, report.daysAgo / halfLife);
    return sum + report.severity * decay;
  }, 0);

  visibleReports.forEach((report) => {
    const decay = Math.pow(0.5, report.daysAgo / halfLife);
    const intensity = Math.min(1, (report.severity * decay) / 5);
    const spot = document.createElement("div");
    spot.className = `heat-spot ${intensity > 0.45 ? "heat-high" : "heat-low"}`;
    spot.style.setProperty("--x", `${report.x}%`);
    spot.style.setProperty("--y", `${report.y}%`);
    spot.style.setProperty("--size", `${110 + report.severity * 24}px`);
    spot.style.setProperty("--opacity", `${0.18 + intensity * 0.58}`);
    elements.heatLayer.appendChild(spot);
  });

  elements.safeScore.textContent = Math.max(34, Math.round(92 - riskTotal * 4));
}

function addAlert(title, body, urgent = true) {
  alertCount += 1;
  elements.openIncidents.textContent = alertCount;

  const card = document.createElement("article");
  card.className = "alert-card";
  card.innerHTML = `
    <strong>${title}<span>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></strong>
    <p>${body}</p>
    <p>${urgent ? "Status: authority notified, response team assigned." : "Status: logged for monitoring."}</p>
  `;
  elements.alertList.prepend(card);
}

async function triggerPanic() {
  const point = routePoints[routeIndex];
  const risk = classifyRisk(point);
  addAlert(
    "SOS emergency alert",
    `${tourist.name} (${tourist.id}) requested help at ${point.label}. Risk level: ${risk.label}. Emergency contact: ${tourist.emergencyContact}.`,
    true
  );
  showToast("SOS sent with current location, tourist ID, and risk context.");
  setMode("admin");

  if ("Notification" in window) {
    const permission = Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("SafeTrail SOS alert", {
        body: `${tourist.name} needs help at ${point.label}.`
      });
    }
  }
}

function submitReport(event) {
  event.preventDefault();
  const point = routePoints[routeIndex];
  const type = document.querySelector("#incidentType").value;
  const location = document.querySelector("#incidentLocation").value.trim() || point.label;
  const severity = Number(document.querySelector("#severity").value);

  crimeReports.unshift({
    x: point.x + (Math.random() * 8 - 4),
    y: point.y + (Math.random() * 8 - 4),
    daysAgo: 0,
    severity,
    type
  });

  addAlert(`${type} report`, `${location} was added to the live incident dataset.`, severity >= 4);
  renderHeatmap();
  event.target.reset();
  showToast("Report submitted. The heatmap now treats it as a recent incident.");
}

function clearResolvedAlerts() {
  elements.alertList.innerHTML = "";
  alertCount = 0;
  elements.openIncidents.textContent = "0";
  showToast("Resolved alerts cleared from the authority dashboard.");
}

function moveRoute(step) {
  routeIndex = Math.max(0, Math.min(routePoints.length - 1, routeIndex + step));
  updateLocation(routePoints[routeIndex]);
}

function useGps() {
  if (!navigator.geolocation) {
    showToast("This browser does not support GPS access. Simulation remains active.");
    return;
  }

  elements.gpsStatus.textContent = "Requesting GPS permission";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const mappedPoint = {
        label: `GPS fix ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        x: 50 + ((longitude * 100) % 18),
        y: 50 + ((latitude * 100) % 18)
      };
      updateLocation(mappedPoint, "Browser GPS active");
      showToast("GPS location received. Demo map position has been approximated.");
    },
    () => {
      elements.gpsStatus.textContent = "Simulated GPS active";
      showToast("GPS permission was not granted. Simulation remains active.");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll(".step-button").forEach((button) => {
  button.addEventListener("click", () => moveRoute(Number(button.dataset.step)));
});

document.querySelector("#locateButton").addEventListener("click", useGps);
document.querySelector("#panicButton").addEventListener("click", triggerPanic);
document.querySelector("#reportForm").addEventListener("submit", submitReport);
document.querySelector("#clearAlerts").addEventListener("click", clearResolvedAlerts);
elements.categoryFilter.addEventListener("change", renderMarkers);
elements.timeframeFilter.addEventListener("change", renderHeatmap);

elements.touristName.textContent = tourist.name;
renderZones();
renderMarkers();
renderZoneList();
renderHeatmap();
selectPlace(selectedPlaceId);
updateLocation(routePoints[routeIndex]);
