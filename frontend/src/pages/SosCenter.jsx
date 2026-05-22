import { useState } from "react";
import toast from "react-hot-toast";
import { Radio, ShieldAlert, TimerReset } from "lucide-react";
import api from "../api/client";
import SosButton from "../components/SosButton";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAuth } from "../context/AuthContext";

export default function SosCenter() {
  const { user } = useAuth();
  const { location, requestLocation } = useGeolocation({ watch: true });
  const [countdown, setCountdown] = useState(5);
  const [armed, setArmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  function armCountdown() {
    setArmed(true);
    let value = 5;
    setCountdown(value);
    const timer = window.setInterval(() => {
      value -= 1;
      setCountdown(value);
      if (value <= 0) {
        window.clearInterval(timer);
        setArmed(false);
        triggerSos();
      }
    }, 1000);
    window.safetourSosTimer = timer;
  }

  function cancelFalseAlarm() {
    window.clearInterval(window.safetourSosTimer);
    setArmed(false);
    toast.success("False alarm cancelled");
  }

  async function triggerSos() {
    setSending(true);
    try {
      const { data } = await api.post("/emergencies/sos", {
        message: "SOS triggered from SafeTour AI emergency center",
        alarmEnabled: user?.preferences?.loudAlarm ?? true,
        location
      });
      setLastEvent(data.event);
      toast.success("SOS broadcast sent to admins and trusted contacts");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-red-400">Emergency network</p>
        <h1 className="text-3xl font-black">SOS Center</h1>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card grid place-items-center gap-5 py-10 text-center">
          <SosButton onClick={armCountdown} loading={sending} />
          {armed ? (
            <div className="grid gap-3">
              <p className="text-4xl font-black text-red-500">{countdown}</p>
              <button className="btn-secondary" onClick={cancelFalseAlarm}><TimerReset size={18} /> Cancel false alarm</button>
            </div>
          ) : (
            <p className="max-w-md text-sm text-slate-500">Press SOS to start a 5-second countdown. If not cancelled, location is broadcast to admins and emergency contacts.</p>
          )}
        </div>
        <aside className="grid gap-4">
          <div className="card">
            <ShieldAlert className="text-red-500" />
            <h2 className="mt-2 text-xl font-black">Current GPS payload</h2>
            <p className="mt-2 text-sm text-slate-500">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
            <button className="btn-secondary mt-3" onClick={requestLocation}>Refresh location</button>
          </div>
          <div className="card">
            <Radio className="text-cyan-400" />
            <h2 className="mt-2 text-xl font-black">Tourist network</h2>
            <p className="mt-2 text-sm text-slate-500">Nearby tourists receive a volunteer help notification through the SOS network API.</p>
            {lastEvent && <p className="mt-3 text-sm font-bold text-safety-green">Last event: {lastEvent.status}</p>}
          </div>
        </aside>
      </section>
    </main>
  );
}
