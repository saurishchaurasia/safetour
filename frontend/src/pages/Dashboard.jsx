import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Clock, MapPin, ShieldCheck } from "lucide-react";
import api from "../api/client";
import SosButton from "../components/SosButton";
import MapPanel from "../components/MapPanel";
import { useAuth } from "../context/AuthContext";
import { useGeolocation } from "../hooks/useGeolocation";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const { location, requestLocation } = useGeolocation({ watch: true });
  const [sending, setSending] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get("/alerts").then(({ data }) => setAlerts(data.alerts)).catch(() => null);
  }, []);

  async function triggerSos() {
    setSending(true);
    try {
      await api.post("/emergencies/sos", {
        message: "Emergency assistance requested from dashboard",
        alarmEnabled: user?.preferences?.loudAlarm ?? true,
        location
      });
      if (user?.preferences?.loudAlarm) playAlarmTone();
      toast.success("SOS sent to contacts and admin dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  async function confirmCheckIn() {
    try {
      const { data } = await api.post("/users/me/check-in");
      setUser(data.user);
      localStorage.setItem("sts_user", JSON.stringify(data.user));
      toast.success("Safety check-in confirmed");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <main className="page">
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card grid gap-4">
          <p className="text-sm font-black uppercase text-safety-green">Live dashboard</p>
          <h1 className="text-3xl font-black sm:text-4xl">Hello, {user?.name}</h1>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={MapPin} label="GPS status" value="Tracking" />
            <Metric icon={Bell} label="Nearby alerts" value={alerts.length} />
            <Metric icon={ShieldCheck} label="Trip sharing" value={user?.tripStatus?.sharingEnabled ? "On" : "Off"} />
          </div>
          <button className="btn-secondary w-fit" onClick={requestLocation}>Refresh GPS location</button>
        </div>
        <div className="card grid place-items-center gap-3">
          <SosButton onClick={triggerSos} loading={sending} />
          <p className="text-center text-sm text-slate-500">Sends live location to trusted contacts and authority dashboard.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <div className="card">
          <MapPanel location={location} alerts={alerts} />
        </div>
        <aside className="grid gap-4">
          <div className="card">
            <div className="flex items-center gap-2"><Clock className="text-safety-amber" /><h2 className="text-xl font-black">Check-in timer</h2></div>
            <p className="mt-2 text-sm text-slate-500">Optional safety timer. If missed, the backend can trigger an automatic SOS job.</p>
            <button className="btn-primary mt-4 w-full" onClick={confirmCheckIn}>Confirm safe</button>
          </div>
          <div className="card">
            <h2 className="text-xl font-black">Current coordinates</h2>
            <p className="mt-2 text-sm text-slate-500">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function playAlarmTone() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  window.setTimeout(() => {
    oscillator.stop();
    context.close();
  }, 900);
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <Icon className="text-safety-green" />
      <p className="mt-2 text-sm text-slate-500">{label}</p>
      <strong className="text-2xl font-black">{value}</strong>
    </div>
  );
}
