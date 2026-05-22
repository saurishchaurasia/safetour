import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      tripStatus: {
        sharingEnabled: form.get("sharingEnabled") === "on",
        currentCity: form.get("currentCity"),
        checkInEnabled: form.get("checkInEnabled") === "on",
        checkInMinutes: Number(form.get("checkInMinutes"))
      },
      preferences: {
        darkMode: form.get("darkMode") === "on",
        loudAlarm: form.get("loudAlarm") === "on",
        pushNotifications: form.get("pushNotifications") === "on"
      }
    };

    try {
      const { data } = await api.patch("/users/me", payload);
      setUser(data.user);
      localStorage.setItem("sts_user", JSON.stringify(data.user));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-safety-green">Profile and safety settings</p>
        <h1 className="text-3xl font-black">Account</h1>
      </div>
      <form onSubmit={submit} className="card grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">Name<input className="input" name="name" defaultValue={user?.name} required /></label>
          <label className="label">Phone<input className="input" name="phone" defaultValue={user?.phone} /></label>
          <label className="label">Current city<input className="input" name="currentCity" defaultValue={user?.tripStatus?.currentCity} /></label>
          <label className="label">Check-in minutes<input className="input" name="checkInMinutes" type="number" min="5" max="720" defaultValue={user?.tripStatus?.checkInMinutes || 30} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle name="sharingEnabled" label="Share trip status with family" checked={user?.tripStatus?.sharingEnabled} />
          <Toggle name="checkInEnabled" label="Enable check-in timer" checked={user?.tripStatus?.checkInEnabled} />
          <Toggle name="loudAlarm" label="Play loud alarm on SOS" checked={user?.preferences?.loudAlarm} />
          <Toggle name="pushNotifications" label="Allow push notifications" checked={user?.preferences?.pushNotifications} />
          <Toggle name="darkMode" label="Prefer dark dashboard" checked={user?.preferences?.darkMode} />
        </div>
        <button className="btn-primary w-fit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      </form>
    </main>
  );
}

function Toggle({ name, label, checked }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 font-semibold dark:border-slate-800">
      <input name={name} type="checkbox" defaultChecked={checked} />
      {label}
    </label>
  );
}
