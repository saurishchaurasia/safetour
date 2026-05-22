import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from "react-leaflet";
import L from "leaflet";

const userIcon = L.divIcon({
  className: "",
  html: "<span style='display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#2563eb;color:white;border:3px solid white;font-weight:900;box-shadow:0 8px 18px rgba(15,23,42,.3)'>U</span>",
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const serviceIcon = L.divIcon({
  className: "",
  html: "<span style='display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:#16734b;color:white;border:2px solid white;font-weight:900;box-shadow:0 8px 18px rgba(15,23,42,.24)'>+</span>",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const defaultServices = [
  { id: "hospital", type: "Hospital", name: "City Care Hospital", latitude: 28.617, longitude: 77.215, distance: "1.1 km" },
  { id: "police", type: "Police", name: "Central Police Station", latitude: 28.612, longitude: 77.205, distance: "750 m" },
  { id: "pharmacy", type: "Pharmacy", name: "24x7 MedPlus", latitude: 28.616, longitude: 77.209, distance: "500 m" },
  { id: "hotel", type: "Hotel", name: "SafeStay Hotel", latitude: 28.61, longitude: 77.212, distance: "900 m" }
];

function validLocation(location) {
  return Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude)
    && location.latitude >= -90 && location.latitude <= 90
    && location.longitude >= -180 && location.longitude <= 180;
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center[0], center[1], map]);
  return null;
}

export default function MapPanel({ location, alerts = [], services = defaultServices, heatmap = [] }) {
  const safeLocation = validLocation(location) ? location : { latitude: 28.6139, longitude: 77.2090, addressLabel: "Approximate fallback location" };
  const center = [safeLocation.latitude, safeLocation.longitude];

  return (
    <MapContainer center={center} zoom={14} className="h-[440px] w-full">
      <RecenterMap center={center} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={userIcon}>
        <Popup>
          <strong>{safeLocation.source === "manual" ? "Manual emergency location" : "Emergency location"}</strong>
          <br />
          {safeLocation.addressLabel || "Area name unavailable"}
          {safeLocation.landmark && (
            <>
              <br />
              Landmark: {safeLocation.landmark}
            </>
          )}
          <br />
          {safeLocation.latitude.toFixed(5)}, {safeLocation.longitude.toFixed(5)}
          {safeLocation.accuracy ? ` · accuracy ${Math.round(safeLocation.accuracy)} m` : ""}
        </Popup>
      </Marker>
      {services.map((service) => (
        <Marker key={service.id} position={[service.latitude, service.longitude]} icon={serviceIcon}>
          <Popup>
            <strong>{service.name}</strong>
            <br />
            {service.type} · {service.distance}
          </Popup>
        </Marker>
      ))}
      {alerts.map((alert) => (
        <Circle
          key={alert._id}
          center={[alert.location.latitude, alert.location.longitude]}
          radius={alert.location.radiusMeters}
          pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.16 }}
        />
      ))}
      {heatmap.map((point) => (
        <Circle
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={point.radiusMeters}
          pathOptions={{
            color: point.color === "red" ? "#dc2626" : point.color === "orange" ? "#f97316" : point.color === "yellow" ? "#eab308" : "#16a34a",
            fillColor: point.color === "red" ? "#dc2626" : point.color === "orange" ? "#f97316" : point.color === "yellow" ? "#eab308" : "#16a34a",
            fillOpacity: 0.22
          }}
        >
          <Popup>
            <strong>{point.name}</strong>
            <br />
            AI danger score: {point.dangerScore}%
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
