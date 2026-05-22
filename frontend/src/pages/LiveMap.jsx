import { useEffect, useState } from "react";
import { Hospital, Hotel, MapPinned, Pill, Shield } from "lucide-react";
import api from "../api/client";
import MapPanel from "../components/MapPanel";
import { useGeolocation } from "../hooks/useGeolocation";

const services = [
  { id: "hospital", icon: Hospital, type: "Hospital", name: "City Care Hospital", latitude: 28.617, longitude: 77.215, distance: "1.1 km" },
  { id: "police", icon: Shield, type: "Police", name: "Central Police Station", latitude: 28.612, longitude: 77.205, distance: "750 m" },
  { id: "pharmacy", icon: Pill, type: "Pharmacy", name: "24x7 MedPlus", latitude: 28.616, longitude: 77.209, distance: "500 m" },
  { id: "hotel", icon: Hotel, type: "Hotel", name: "SafeStay Hotel", latitude: 28.61, longitude: 77.212, distance: "900 m" }
];

export default function LiveMap() {
  const { location, requestLocation } = useGeolocation({ watch: true });
  const [alerts, setAlerts] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    api.get("/alerts").then(({ data }) => setAlerts(data.alerts)).catch(() => null);
    api.get("/heatmap").then(({ data }) => setHeatmap(data.points)).catch(() => null);
  }, []);

  return (
    <main className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-safety-green">Live map</p>
          <h1 className="text-3xl font-black">Nearby help services</h1>
        </div>
        <button className="btn-primary" onClick={requestLocation}><MapPinned size={18} /> Update GPS</button>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <div className="card">
          <MapPanel location={location} alerts={alerts} services={services} heatmap={heatmap} />
        </div>
        <aside className="grid gap-3">
          {services.map(({ icon: Icon, ...service }) => (
            <article key={service.id} className="card">
              <Icon className="text-safety-green" />
              <h2 className="mt-2 font-black">{service.name}</h2>
              <p className="text-sm text-slate-500">{service.type} · {service.distance}</p>
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
}
