import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Circle,
  useMap,
  useMapEvents
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";

const userIcon = L.divIcon({
  className: "",
  html: "<span style='display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#2563eb;color:white;border:3px solid white;font-weight:900;'>U</span>",
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const serviceIcon = L.divIcon({
  className: "",
  html: "<span style='display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:#16a34a;color:white;border:2px solid white;font-weight:900;'>+</span>",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const defaultServices = [
  {
    id: "hospital",
    type: "Hospital",
    name: "Apollo Hospital",
    latitude: 12.9121,
    longitude: 77.6446,
    distance: "1.1 km"
  },
  {
    id: "police",
    type: "Police",
    name: "South Bengaluru Police",
    latitude: 12.918,
    longitude: 77.623,
    distance: "750 m"
  }
];

function validLocation(location) {
  return Number.isFinite(location?.latitude)
    && Number.isFinite(location?.longitude);
}

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), {
      animate: true
    });
  }, [center, map]);

  return null;
}

function MapClickAnalyzer({ setAnalysis }) {
  useMapEvents({
    async click(event) {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
          "http://localhost:5000/api/heatmap/analyze",
          {
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
            radiusMeters: 1200
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAnalysis({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
          data: response.data.analytics
        });

      } catch (error) {
        console.error(error);

        alert(
          error?.response?.data?.message
          || "Area analysis failed"
        );
      }
    }
  });

  return null;
}

export default function MapPanel({
  location,
  alerts = [],
  services = defaultServices,
  heatmap = []
}) {
  const [analysis, setAnalysis] = useState(null);

  const safeLocation = validLocation(location)
    ? location
    : {
        latitude: 12.9121,
        longitude: 77.6446,
        addressLabel: "South Bengaluru"
      };

  const center = [
    safeLocation.latitude,
    safeLocation.longitude
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-[440px] w-full rounded-xl z-0"
    >
      <RecenterMap center={center} />

      <MapClickAnalyzer setAnalysis={setAnalysis} />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={center} icon={userIcon}>
        <Popup>
          <div>
            <strong>
              {safeLocation.addressLabel || "Your Location"}
            </strong>

            <br />

            {safeLocation.latitude.toFixed(5)},
            {" "}
            {safeLocation.longitude.toFixed(5)}
          </div>
        </Popup>
      </Marker>

      {services.map((service) => (
        <Marker
          key={service.id}
          position={[
            service.latitude,
            service.longitude
          ]}
          icon={serviceIcon}
        >
          <Popup>
            <strong>{service.name}</strong>

            <br />

            {service.type}
            {" · "}
            {service.distance}
          </Popup>
        </Marker>
      ))}

      {alerts.map((alert) => (
        <Circle
          key={alert._id}
          center={[
            alert.location.latitude,
            alert.location.longitude
          ]}
          radius={alert.location.radiusMeters || 500}
          pathOptions={{
            color: "#dc2626",
            fillColor: "#dc2626",
            fillOpacity: 0.18
          }}
        />
      ))}

      {Array.isArray(heatmap) && heatmap.map((point, index) => (
        <Circle
          key={point.id || index}
          center={[
            point.latitude,
            point.longitude
          ]}
          radius={point.radiusMeters || 700}
          pathOptions={{
            color:
              point.dangerScore >= 80
                ? "#dc2626"
                : point.dangerScore >= 60
                ? "#f97316"
                : point.dangerScore >= 35
                ? "#eab308"
                : "#16a34a",

            fillColor:
              point.dangerScore >= 80
                ? "#dc2626"
                : point.dangerScore >= 60
                ? "#f97316"
                : point.dangerScore >= 35
                ? "#eab308"
                : "#16a34a",

            fillOpacity: 0.28
          }}
        >
          <Popup>
            <div className="space-y-2 min-w-[220px]">
              <h3 className="font-bold text-lg">
                {point.crimeType || point.name || "Danger Zone"}
              </h3>

              <p>
                <strong>Danger Score:</strong>
                {" "}
                {point.dangerScore || 0}/100
              </p>

              <p>
                <strong>Risk Level:</strong>
                {" "}
                {point.riskLevel || "Unknown"}
              </p>

              <p>
                <strong>Total Crimes:</strong>
                {" "}
                {point.totalCrimes || 0}
              </p>

              <div>
                <strong>Likely Crimes:</strong>

                <ul className="list-disc ml-5">
                  {(point.topCrimes || []).map((crime, idx) => (
                    <li key={idx}>
                      {crime.crimeType || "Unknown"}
                      {" "}
                      ({crime.probability || 0}%)
                    </li>
                  ))}
                </ul>
              </div>

              <p>
                <strong>Recommendation:</strong>
                {" "}
                {point.recommendation
                  || "Stay alert in this area."}
              </p>
            </div>
          </Popup>
        </Circle>
      ))}

      {analysis && (
        <Marker
          position={[
            analysis.latitude,
            analysis.longitude
          ]}
        >
          <Popup open={true}>
            <div className="space-y-2 min-w-[240px]">
              <h3 className="font-bold text-lg">
                Area Safety Analysis
              </h3>

              <p>
                <strong>Danger Score:</strong>
                {" "}
                {analysis.data?.dangerScore || 0}/100
              </p>

              <p>
                <strong>Risk Level:</strong>
                {" "}
                {analysis.data?.riskLevel || "Unknown"}
              </p>

              <p>
                <strong>Total Crimes:</strong>
                {" "}
                {analysis.data?.totalCrimes || 0}
              </p>

              <div>
                <strong>Likely Crimes:</strong>

                <ul className="list-disc ml-5">
                  {(analysis.data?.topCrimes || []).map((crime, idx) => (
                    <li key={idx}>
                      {crime.crimeType}
                      {" "}
                      ({crime.probability}%)
                    </li>
                  ))}
                </ul>
              </div>

              <p>
                <strong>Recommendation:</strong>
                {" "}
                {analysis.data?.recommendation
                  || "Stay alert."}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}