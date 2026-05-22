const STORAGE_KEY = "antigravity_safe_tour_state";

const initialPois = [
  { id: "fort", name: "Amber Fort View", type: "monument", lat: 28.6136, lng: 77.2051, safety: 88, rating: 4.6, reviews: [{ user: "Mira", score: 5, text: "Well lit and police nearby." }] },
  { id: "museum", name: "City Museum", type: "monument", lat: 28.618, lng: 77.212, safety: 92, rating: 4.8, reviews: [{ user: "Rohan", score: 5, text: "Clean, accessible, and safe." }] },
  { id: "bistro", name: "Riverside Bistro", type: "restaurant", lat: 28.609, lng: 77.214, safety: 83, rating: 4.3, reviews: [{ user: "Leah", score: 4, text: "Good tourist crowd." }] },
  { id: "market", name: "Night Market Cafe", type: "restaurant", lat: 28.616, lng: 77.202, safety: 61, rating: 3.9, reviews: [{ user: "Aarav", score: 3, text: "Crowded after dark." }] },
  { id: "hospital", name: "City Care Hospital", type: "hospital", lat: 28.621, lng: 77.216, safety: 95, rating: 4.7, reviews: [] },
  { id: "police", name: "Central Police Station", type: "police", lat: 28.611, lng: 77.207, safety: 97, rating: 4.5, reviews: [] }
];

const dangerZones = [
  { id: "old-market", name: "Old Market South Lane", lat: 28.616, lng: 77.202, radius: 560, color: "#ff3860", risk: 91 },
  { id: "river-bank", name: "Low Light River Bank", lat: 28.608, lng: 77.214, radius: 430, color: "#ff8f3d", risk: 68 },
  { id: "central", name: "Central Plaza Crowd Zone", lat: 28.614, lng: 77.209, radius: 360, color: "#ffdd57", risk: 46 },
  { id: "museum-safe", name: "Museum Safe Corridor", lat: 28.618, lng: 77.212, radius: 330, color: "#00d1b2", risk: 14 }
];

const touristPath = [
  [28.6128, 77.2068],
  [28.6134, 77.2082],
  [28.6142, 77.2094],
  [28.6151, 77.2072],
  [28.6161, 77.2025],
  [28.6147, 77.2058]
];

const state = loadState();
let map;
let poiLayer;
let heatLayer;
let touristMarker;
let sosMarker;
let currentPathIndex = 0;
let sosTimer;
let socketPingTimer;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const seeded = {
    users: [{
      name: "Demo Tourist",
      email: "demo@safetour.ai",
      nationality: "Indian",
      passwordHash: mockHash("password123"),
      touristId: generateTouristId(),
      token: null
    }],
    currentUser: null,
    pois: initialPois,
    sosEvents: [],
    logs: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mockHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `bcrypt$sim$${Math.abs(hash >>> 0).toString(16)}`;
}

function mockJwt(user) {
  return btoa(JSON.stringify({ sub: user.touristId, email: user.email, exp: Date.now() + 86400000 }));
}

function generateTouristId() {
  return `TID${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

function $(selector) {
  return document.querySelector(selector);
}

function log(message, type = "info") {
  const item = { at: new Date().toLocaleTimeString(), message, type };
  state.logs.push(item);
  state.logs = state.logs.slice(-80);
  saveState();
  renderLogs();
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("is-visible");
  window.setTimeout(() => element.classList.remove("is-visible"), 3000);
}

function setScreen(screen) {
  $("#authScreen").classList.toggle("is-active", screen === "auth");
  $("#homeScreen").classList.toggle("is-active", screen === "home");
}

function renderSession() {
  const user = state.currentUser;
  $("#sessionPill").textContent = user ? `${user.name} · ${user.touristId}` : "Guest simulator";
  if (!user) {
    setScreen("auth");
    return;
  }
  $("#mobileUserName").textContent = user.name;
  $("#touristId").textContent = user.touristId;
  $("#gpsStatus").textContent = "Live";
  setScreen("home");
}

function setupAuth() {
  document.querySelectorAll(".auth-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach((tab) => tab.classList.remove("is-active"));
      document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("is-active"));
      button.classList.add("is-active");
      $(`#${button.dataset.auth}Form`).classList.add("is-active");
    });
  });

  $("#registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("#registerEmail").value.trim().toLowerCase();
    if (state.users.some((user) => user.email === email)) {
      toast("Account already exists. Try login.");
      return;
    }
    const user = {
      name: $("#registerName").value.trim(),
      email,
      nationality: $("#registerNationality").value.trim(),
      passwordHash: mockHash($("#registerPassword").value),
      touristId: generateTouristId(),
      token: null
    };
    state.users.push(user);
    state.currentUser = { ...user, token: mockJwt(user) };
    saveState();
    log(`AUTH register ${user.email} issued ${user.touristId}`, "ok");
    renderSession();
    toast("Digital Tourist ID generated.");
  });

  $("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const user = state.users.find((item) => item.email === email);
    if (!user || user.passwordHash !== mockHash($("#loginPassword").value)) {
      toast("Invalid simulated credentials.");
      log(`AUTH failed login for ${email}`, "warn");
      return;
    }
    state.currentUser = { ...user, token: mockJwt(user) };
    saveState();
    log(`AUTH jwt handshake ok for ${user.touristId}`, "ok");
    renderSession();
  });

  $("#logoutBtn").addEventListener("click", () => {
    log(`AUTH logout ${state.currentUser?.touristId || "unknown"}`, "info");
    state.currentUser = null;
    saveState();
    renderSession();
  });
}

function initMap() {
  map = L.map("safetyMap", { zoomControl: false }).setView([28.614, 77.209], 14);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO"
  }).addTo(map);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  poiLayer = L.layerGroup().addTo(map);
  heatLayer = L.layerGroup().addTo(map);
  renderHeatmap();
  renderPois("all");
  touristMarker = L.marker(touristPath[0], { icon: divIcon("T", "tourist-marker", "#00d1b2") }).addTo(map);
}

function divIcon(text, className, color) {
  return L.divIcon({
    className: "",
    html: `<div class="${className || "poi-marker"}" style="width:34px;height:34px;background:${color};">${text}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function renderHeatmap() {
  heatLayer.clearLayers();
  if (!$("#heatToggle")?.checked) return;
  dangerZones.forEach((zone) => {
    L.circle([zone.lat, zone.lng], {
      radius: zone.radius,
      color: zone.color,
      fillColor: zone.color,
      fillOpacity: 0.18,
      weight: 2,
      dashArray: zone.risk > 70 ? "0" : "8 8"
    }).bindPopup(`<strong>${zone.name}</strong><br>AI danger score: ${zone.risk}%`).addTo(heatLayer);
  });
}

function renderPois(filter = "all") {
  poiLayer.clearLayers();
  state.pois
    .filter((poi) => filter === "all" || poi.type === filter)
    .forEach((poi) => {
      const color = poi.type === "hospital" ? "#48c78e" : poi.type === "police" ? "#4aa3ff" : poi.type === "monument" ? "#ffdd57" : "#00d1b2";
      const marker = L.marker([poi.lat, poi.lng], { icon: divIcon(poi.type[0].toUpperCase(), "poi-marker", color) })
        .bindPopup(`<strong>${poi.name}</strong><br>${poi.type}<br>Safety index: ${poi.safety}%<br>Tourist rating: ${poi.rating.toFixed(1)}`);
      marker.addTo(poiLayer);
    });
}

function startTouristMovement() {
  window.setInterval(() => {
    currentPathIndex = (currentPathIndex + 1) % touristPath.length;
    const coords = touristPath[currentPathIndex];
    touristMarker?.setLatLng(coords);
    log(`GPS tourist: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`, "info");
  }, 4200);
}

function setupSos() {
  $("#sosButton").addEventListener("click", () => {
    if (!state.currentUser) {
      toast("Login required before SOS.");
      return;
    }
    let remaining = 3;
    $("#cancelSosBtn").classList.add("is-visible");
    $("#countdown").textContent = remaining;
    log(`SOS countdown armed by ${state.currentUser.touristId}`, "warn");
    sosTimer = window.setInterval(() => {
      remaining -= 1;
      $("#countdown").textContent = remaining > 0 ? remaining : "";
      if (remaining <= 0) {
        window.clearInterval(sosTimer);
        $("#cancelSosBtn").classList.remove("is-visible");
        triggerSos();
      }
    }, 1000);
  });

  $("#cancelSosBtn").addEventListener("click", () => {
    window.clearInterval(sosTimer);
    $("#countdown").textContent = "";
    $("#cancelSosBtn").classList.remove("is-visible");
    log("SOS false alarm cancelled by tourist", "ok");
    toast("False alarm cancelled.");
  });
}

function triggerSos() {
  const coords = touristPath[currentPathIndex];
  const event = {
    id: crypto.randomUUID?.() || `sos-${Date.now()}`,
    touristId: state.currentUser.touristId,
    name: state.currentUser.name,
    coords,
    at: new Date().toLocaleTimeString(),
    status: "Dispatching"
  };
  state.sosEvents.unshift(event);
  saveState();
  $("#sosCount").textContent = state.sosEvents.length;
  log(`SOCKET broadcast:sos ${event.touristId} @ ${coords[0].toFixed(4)},${coords[1].toFixed(4)}`, "danger");
  toast("SOS dispatched to admin and nearby tourists.");
  if (sosMarker) sosMarker.remove();
  sosMarker = L.marker(coords, { icon: divIcon("!", "sos-marker", "#ff3860") }).addTo(map);
  map.setView(coords, 16);
  renderDispatch();
  playAlarm();
}

function playAlarm() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.06;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  window.setTimeout(() => {
    oscillator.stop();
    context.close();
  }, 750);
}

function renderPoiList() {
  $("#poiList").innerHTML = state.pois.map((poi) => {
    const reviewCount = poi.reviews.length;
    const stars = "★".repeat(Math.round(poi.rating)).padEnd(5, "☆");
    return `
      <article class="poi-card" data-poi="${poi.id}">
        <header><strong>${poi.name}</strong><span class="stars">${stars}</span></header>
        <p>${poi.type} · Safety ${poi.safety}% · ${reviewCount} tourist reviews</p>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".poi-card").forEach((card) => {
    card.addEventListener("click", () => submitReview(card.dataset.poi));
  });
}

function submitReview(id) {
  if (!state.currentUser) {
    toast("Verified Tourist ID required to review.");
    return;
  }
  const poi = state.pois.find((item) => item.id === id);
  const score = Number(prompt(`Rate ${poi.name} from 1-5`, "5"));
  if (!score || score < 1 || score > 5) return;
  poi.reviews.push({ user: state.currentUser.name, score, text: "Verified tourist review." });
  poi.rating = poi.reviews.reduce((sum, review) => sum + review.score, 0) / poi.reviews.length;
  $("#ratingCount").textContent = state.pois.reduce((sum, item) => sum + item.reviews.length, 0);
  saveState();
  renderPoiList();
  renderPois(document.querySelector(".chip.is-active")?.dataset.filter || "all");
  log(`REVIEW ${state.currentUser.touristId} rated ${poi.name} ${score}/5`, "ok");
  toast("Tourist-only review submitted.");
}

function setupAdminControls() {
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      $("#appShell").className = `app-shell ${button.dataset.view === "split" ? "" : `${button.dataset.view}-only`}`;
      setTimeout(() => map?.invalidateSize(), 220);
    });
  });

  document.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderPois(button.dataset.filter);
      log(`MAP poi filter set to ${button.dataset.filter}`, "info");
    });
  });

  $("#heatToggle").addEventListener("change", () => {
    renderHeatmap();
    log(`MAP danger heatmap ${$("#heatToggle").checked ? "enabled" : "disabled"}`, "info");
  });

  $("#broadcastBtn").addEventListener("click", () => {
    const message = $("#broadcastMessage").value.trim();
    if (!message) return;
    log(`SOCKET admin:broadcast "${message}"`, "warn");
    toast("Broadcast delivered to connected tourists.");
    $("#dispatchFeed").insertAdjacentHTML("afterbegin", `<p>${new Date().toLocaleTimeString()} · Broadcast: ${message}</p>`);
  });

  $("#clearLogsBtn").addEventListener("click", () => {
    state.logs = [];
    saveState();
    renderLogs();
  });

  $("#seedReviewBtn").addEventListener("click", () => submitReview("fort"));
}

function renderLogs() {
  $("#socketLog").innerHTML = state.logs.slice().reverse().map((item) => (
    `<div class="log-line log-${item.type}">[${item.at}] ${item.message}</div>`
  )).join("");
}

function renderDispatch() {
  $("#dispatchFeed").innerHTML = state.sosEvents.map((event) => (
    `<p><strong>${event.at}</strong> · ${event.name} (${event.touristId}) · ${event.status}</p>`
  )).join("");
}

function startMockSocket() {
  log("SOCKET server booted in browser simulation", "ok");
  socketPingTimer = window.setInterval(() => {
    log(`SOCKET ping ${Math.round(performance.now())}ms active tourists=7`, "info");
  }, 6000);
}

function init() {
  setupAuth();
  setupSos();
  setupAdminControls();
  renderSession();
  renderPoiList();
  renderLogs();
  renderDispatch();
  $("#sosCount").textContent = state.sosEvents.length;
  $("#ratingCount").textContent = state.pois.reduce((sum, item) => sum + item.reviews.length, 0);
  initMap();
  startTouristMovement();
  startMockSocket();
  lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", init);
