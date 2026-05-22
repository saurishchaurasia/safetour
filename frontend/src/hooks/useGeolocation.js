import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const fallback = {
  latitude: Number(import.meta.env.VITE_DEFAULT_LAT || 28.6139),
  longitude: Number(import.meta.env.VITE_DEFAULT_LNG || 77.2090),
  accuracy: null,
  addressLabel: "Approximate demo location",
  landmark: "New Delhi, India",
  source: "simulation"
};

function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

async function reverseGeocode(latitude, longitude) {
  if (!isValidCoordinate(latitude, longitude)) return {};
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      { signal: controller.signal, headers: { Accept: "application/json" } }
    );
    if (!response.ok) return {};
    const data = await response.json();
    const address = data.address || {};
    const area = address.neighbourhood || address.suburb || address.city_district || address.city || address.town || address.village || data.name;
    const landmark = data.name || address.road || address.tourism || address.amenity || "";
    return {
      addressLabel: data.display_name || area || "",
      landmark: landmark && landmark !== area ? landmark : area || ""
    };
  } catch (error) {
    console.warn("Reverse geocoding failed", error.message);
    return {};
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useGeolocation({ watch = false } = {}) {
  const [location, setLocation] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("approximate");
  const [error, setError] = useState(null);
  const watchId = useRef(null);

  function persistLocation(next, source = "gps") {
    const clean = { ...next, source };
    if (!isValidCoordinate(clean.latitude, clean.longitude)) {
      setError("Invalid coordinates. Please enter a valid location.");
      toast.error("Invalid coordinates");
      return false;
    }
    setLocation(clean);
    setStatus(source);
    setError(null);
    api.post("/locations", clean).catch((requestError) => {
      console.warn("Location persistence failed", requestError.message);
    });
    return true;
  }

  async function persistPosition(position, source = "gps", label = "Live GPS position") {
    const base = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      heading: position.coords.heading,
      addressLabel: label,
      landmark: "",
      source
    };
    const enriched = await reverseGeocode(base.latitude, base.longitude);
    persistLocation({ ...base, ...enriched }, source);
  }

  function setManualLocation({ latitude, longitude, addressLabel = "Manual emergency location", landmark = "" }) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    return persistLocation({
      latitude: lat,
      longitude: lng,
      accuracy: null,
      addressLabel: addressLabel.trim() || "Manual emergency location",
      landmark: landmark.trim()
    }, "manual");
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("GPS is not supported by this browser. Enter a manual location instead.");
      toast.error("GPS is not supported by this browser");
      persistLocation(fallback, "simulation");
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await persistPosition(position, "gps", "Current GPS position");
        setLoading(false);
      },
      (geoError) => {
        const message = geoError.code === geoError.PERMISSION_DENIED
          ? "Location permission denied. Enter your location manually or use the approximate fallback."
          : "GPS is unavailable or timed out. Enter your location manually or use the approximate fallback.";
        setError(message);
        toast.error(message);
        persistLocation(fallback, "simulation");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  useEffect(() => {
    if (!watch || !navigator.geolocation) return undefined;
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        persistPosition(position, "gps", "Live GPS tracking");
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setStatus("manual");
          setError("Location permission denied. Manual location remains available.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [watch]);

  return { location, loading, status, error, requestLocation, setLocation: persistLocation, setManualLocation };
}
