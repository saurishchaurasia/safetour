import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Marker,
  useMapEvents
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";

import "leaflet/dist/leaflet.css";

// -----------------------------------------------------
// CONFIG
// -----------------------------------------------------

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CENTER = [12.9352, 77.6245];

const RISK_COLORS = {
  Critical: "#ff1744",
  High: "#ff9100",
  Moderate: "#ffd600",
  Low: "#00e676"
};

const CRIME_ICONS = {
  Murder: "🔪",
  Rape: "⚠️",
  "Attempted Murder": "☠️",
  Kidnap: "🚨",
  Robbery: "🦹",
  Assault: "🥊",
  "Chain Snatching": "⛓️",
  "4 Wheeler Theft": "🚗",
  "2 wheeler theft": "🛵",
  "Ordinary Theft": "🎒"
};

// -----------------------------------------------------
// MAP CLICK HANDLER
// -----------------------------------------------------

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

// -----------------------------------------------------
// ANALYSIS POPUP
// -----------------------------------------------------

function AnalysisPopup({ data, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 20, minWidth: 260 }}>
        <div style={{ color: "#fff" }}>Analyzing area...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      style={{
        minWidth: 320,
        color: "white",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700
            }}
          >
            Area Analysis
          </div>

          <div
            style={{
              color: RISK_COLORS[data.riskLevel],
              fontWeight: 600
            }}
          >
            {data.riskLevel} Risk
          </div>
        </div>

        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: RISK_COLORS[data.riskLevel],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 20,
            color: "#000"
          }}
        >
          {data.dangerScore}
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
          padding: 10,
          borderRadius: 10,
          background: "rgba(255,255,255,0.06)"
        }}
      >
        {data.recommendation}
      </div>

      <div
        style={{
          marginBottom: 10,
          fontWeight: 600
        }}
      >
        Likely Crimes
      </div>

      {data.topCrimes?.map((crime, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: 10
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4
            }}
          >
            <span>
              {CRIME_ICONS[crime.crimeType] || "⚫"}{" "}
              {crime.crimeType}
            </span>

            <span>{crime.probability}%</span>
          </div>

          <div
            style={{
              height: 6,
              borderRadius: 20,
              background: "#222"
            }}
          >
            <div
              style={{
                width: `${crime.probability}%`,
                height: "100%",
                borderRadius: 20,
                background: RISK_COLORS[data.riskLevel]
              }}
            />
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 16,
          fontSize: 13,
          color: "#aaa"
        }}
      >
        Total Crimes: {data.totalCrimes}
      </div>
    </div>
  );
}

// -----------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------

export default function MapPanel() {
  const [points, setPoints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [analysisData, setAnalysisData] = useState(null);

  const [analysisPosition, setAnalysisPosition] =
    useState(null);

  // -----------------------------------------------------
  // LOAD HEATMAP
  // -----------------------------------------------------

  useEffect(() => {
    async function fetchHeatmap() {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE}/heatmap`
        );

        if (res.data.success) {
          setPoints(res.data.points || []);
        }
      } catch (err) {
        console.error("Heatmap error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHeatmap();
  }, []);

  // -----------------------------------------------------
  // CLICK ANALYSIS
  // -----------------------------------------------------

  async function analyzeArea(lat, lng) {
    try {
      setAnalysisLoading(true);

      setAnalysisPosition([lat, lng]);

      const res = await axios.post(
        `${API_BASE}/heatmap/analyze`,
        {
          latitude: lat,
          longitude: lng,
          radiusMeters: 600
        }
      );

      if (res.data.success) {
        setAnalysisData(res.data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  }

  // -----------------------------------------------------
  // GLOW ICON
  // -----------------------------------------------------

  const createGlowIcon = (point) => {
    const color =
      RISK_COLORS[point.riskLevel] || "#00e676";

    const size =
      point.dangerScore >= 75
        ? 90
        : point.dangerScore >= 50
        ? 70
        : point.dangerScore >= 25
        ? 50
        : 35;

    return L.divIcon({
      className: "",

      html: `
        <div
          style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            opacity:0.28;
            box-shadow:
              0 0 30px ${color},
              0 0 60px ${color},
              0 0 90px ${color};
            animation:pulse 2s infinite;
          "
        ></div>
      `,

      iconSize: [size, size]
    });
  };

  // -----------------------------------------------------
  // STYLES
  // -----------------------------------------------------

  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      .leaflet-container {
        background:#050816;
      }

      .leaflet-popup-content-wrapper {
        background:rgba(10,15,30,0.96);
        color:white;
        border:1px solid rgba(255,255,255,0.08);
        border-radius:18px;
      }

      .leaflet-popup-tip {
        background:rgba(10,15,30,0.96);
      }

      @keyframes pulse {
        0% {
          transform:scale(1);
        }

        50% {
          transform:scale(1.08);
        }

        100% {
          transform:scale(1);
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // -----------------------------------------------------
  // LEGEND
  // -----------------------------------------------------

  const legend = useMemo(
    () => (
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          zIndex: 1000,
          padding: 14,
          borderRadius: 18,
          background: "rgba(8,12,24,0.92)",
          color: "white",
          width: 180,
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 10
          }}
        >
          Risk Levels
        </div>

        {Object.entries(RISK_COLORS).map(
          ([risk, color]) => (
            <div
              key={risk}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: color,
                  marginRight: 10,
                  boxShadow: `0 0 12px ${color}`
                }}
              />

              {risk}
            </div>
          )
        )}

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#aaa"
          }}
        >
          Click anywhere to analyze an area
        </div>
      </div>
    ),
    []
  );

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative"
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px 18px",
            borderRadius: 12
          }}
        >
          Loading heatmap...
        </div>
      )}

      <MapContainer
        center={CENTER}
        zoom={13}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap & CARTO"
        />

        <ClickHandler onClick={analyzeArea} />

        {/* HEATMAP */}

        {points.map((point) => (
          <Marker
            key={point.id}
            position={[
              point.latitude,
              point.longitude
            ]}
            icon={createGlowIcon(point)}
          >
            <Popup>
              <AnalysisPopup data={point} />
            </Popup>
          </Marker>
        ))}

        {/* ANALYSIS */}

        {analysisPosition && (
          <CircleMarker
            center={analysisPosition}
            radius={12}
            pathOptions={{
              fillColor: "#2196f3",
              color: "#fff",
              weight: 2,
              fillOpacity: 1
            }}
          >
            <Popup autoOpen>
              <AnalysisPopup
                data={analysisData}
                loading={analysisLoading}
              />
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {legend}
    </div>
  );
}