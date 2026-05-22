import { useEffect, useState } from "react";
import api from "../api/client";
import Loading from "../components/Loading";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/alerts")
      .then(({ data }) => setAlerts(data.alerts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-safety-green">Real-time alerts</p>
        <h1 className="text-3xl font-black">Danger and incident alerts</h1>
      </div>
      {loading ? <Loading /> : (
        <div className="grid gap-3">
          {alerts.map((alert) => (
            <article key={alert._id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black">{alert.title}</h2>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-red-700">{alert.severity}</span>
              </div>
              <p className="mt-2 text-slate-500">{alert.message}</p>
              <p className="mt-2 text-sm text-slate-400">{alert.category} · radius {alert.location.radiusMeters} m</p>
            </article>
          ))}
          {!alerts.length && <p className="text-slate-500">No active alerts near you.</p>}
        </div>
      )}
    </main>
  );
}
