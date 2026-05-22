import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const fallback = {
  latitude: Number(import.meta.env.VITE_DEFAULT_LAT || 28.6139),
  longitude: Number(import.meta.env.VITE_DEFAULT_LNG || 77.2090),
  accuracy: null,
  addressLabel: "Simulation location"
};

export function useGeolocation({ watch = false } = {}) {
  const [location, setLocation] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const watchId = useRef(null);

  function persistLocation(next, source = "gps") {
    setLocation(next);
    api.post("/locations", { ...next, source }).catch(() => null);
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      toast.error("GPS is not supported by this browser");
      persistLocation(fallback, "simulation");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          addressLabel: "Current GPS position"
        };
        persistLocation(next);
        setLoading(false);
      },
      () => {
        toast.error("GPS permission denied. Using simulation location.");
        persistLocation(fallback, "simulation");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  useEffect(() => {
    if (!watch || !navigator.geolocation) return undefined;
    watchId.current = navigator.geolocation.watchPosition((position) => {
      persistLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        addressLabel: "Live GPS tracking"
      });
    });
    return () => navigator.geolocation.clearWatch(watchId.current);
  }, [watch]);

  return { location, loading, requestLocation, setLocation };
}
