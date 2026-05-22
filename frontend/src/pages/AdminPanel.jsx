import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import Loading from "../components/Loading";

export default function AdminPanel() {
  const [dashboard, setDashboard] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [dash, emergency] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/emergencies")
      ]);
      setDashboard(dash.data);
      setEvents(emergency.data.events);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function resolve(id, status) {
    await api.patch(`/emergencies/${id}/status`, { status });
    toast.success("Event updated");
    load();
  }

  if (loading) return <main className="page"><Loading label="Loading admin dashboard" /></main>;

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-safety-green">Authority dashboard</p>
        <h1 className="text-3xl font-black">Emergency control center</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Active tourists" value={dashboard?.metrics?.activeTourists || 0} />
        <Metric label="Open SOS events" value={dashboard?.metrics?.openEvents || 0} />
        <Metric label="Active alerts" value={dashboard?.metrics?.activeAlerts || 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card">
          <h2 className="text-xl font-black">Emergency events</h2>
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <article key={event._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong>{event.user?.name || "Unknown tourist"}</strong>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-red-700">{event.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{event.message}</p>
                <p className="mt-2 text-sm text-slate-400">{event.location.latitude}, {event.location.longitude}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={() => resolve(event._id, "acknowledged")}>Acknowledge</button>
                  <button className="btn-primary" onClick={() => resolve(event._id, "resolved")}>Resolve</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="card">
          <h2 className="text-xl font-black">Analytics</h2>
          <div className="mt-4 grid gap-3">
            {(dashboard?.eventsByStatus || []).map((item) => (
              <div key={item._id} className="grid gap-1">
                <div className="flex justify-between text-sm font-semibold"><span>{item._id}</span><span>{item.count}</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full bg-safety-blue" style={{ width: `${Math.min(100, item.count * 18)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="card">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <strong className="text-4xl font-black">{value}</strong>
    </article>
  );
}
