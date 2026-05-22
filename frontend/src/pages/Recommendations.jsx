import { useEffect, useState } from "react";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import api from "../api/client";
import Loading from "../components/Loading";
import { useGeolocation } from "../hooks/useGeolocation";

export default function Recommendations() {
  const { location } = useGeolocation();
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/recommendations", { params: { latitude: location.latitude, longitude: location.longitude, category: category || undefined } }),
      api.get("/recommendations/emergency-services")
    ]).then(([rec, svc]) => {
      setItems(rec.data.recommendations);
      setServices(svc.data.services);
    }).finally(() => setLoading(false));
  }, [category, location.latitude, location.longitude]);

  return (
    <main className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-cyan-400">AI travel suggestions</p>
          <h1 className="text-3xl font-black">Safe places around you</h1>
        </div>
        <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          <option value="monument">Monuments</option>
          <option value="restaurant">Restaurants</option>
          <option value="hotel">Hotels</option>
          <option value="pharmacy">Pharmacies</option>
          <option value="atm">ATMs</option>
        </select>
      </div>
      {loading ? <Loading /> : (
        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => <SuggestionCard key={item._id || item.name} item={item} />)}
          </div>
          <aside className="grid gap-3">
            <h2 className="text-xl font-black">Emergency services</h2>
            {services.map((service) => (
              <article key={service._id || service.name} className="card">
                <h3 className="font-black">{service.name}</h3>
                <p className="text-sm text-slate-500">{service.type} · ETA {service.etaMinutes} min · {service.phone}</p>
              </article>
            ))}
          </aside>
        </section>
      )}
    </main>
  );
}

function SuggestionCard({ item }) {
  return (
    <article className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-cyan-400">{item.category}</p>
          <h2 className="text-xl font-black">{item.name}</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{item.safetyScore}% safe</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{item.description}</p>
      <div className="mt-4 grid gap-2 text-sm text-slate-500">
        <span className="flex items-center gap-2"><Star size={16} /> Tourist {item.touristRating} · Google {item.googleRating}</span>
        <span className="flex items-center gap-2"><MapPin size={16} /> {item.distanceKm} km · {item.estimatedTravelMinutes} min</span>
        <span className="flex items-center gap-2"><ShieldCheck size={16} /> {item.aiReason}</span>
      </div>
    </article>
  );
}
