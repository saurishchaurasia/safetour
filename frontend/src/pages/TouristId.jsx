import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { BadgeCheck, Fingerprint } from "lucide-react";
import api from "../api/client";

export default function TouristId() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/tourist-profiles/me").then(({ data }) => setProfile(data.profile)).catch(() => null);
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await api.put("/tourist-profiles/me", {
        nationality: form.get("nationality"),
        identityType: form.get("identityType"),
        identityNumber: form.get("identityNumber"),
        bloodGroup: form.get("bloodGroup"),
        hotel: {
          name: form.get("hotelName"),
          address: form.get("hotelAddress"),
          phone: form.get("hotelPhone")
        },
        itinerary: [{
          place: form.get("itineraryPlace"),
          city: form.get("itineraryCity"),
          startsAt: new Date(form.get("travelStart")).toISOString(),
          endsAt: new Date(form.get("travelEnd")).toISOString(),
          notes: "Primary travel plan"
        }],
        travelStart: new Date(form.get("travelStart")).toISOString(),
        travelEnd: new Date(form.get("travelEnd")).toISOString()
      });
      setProfile(data.profile);
      toast.success("Digital Tourist ID generated");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function verifyFace() {
    const { data } = await api.post("/tourist-profiles/me/facial-verification");
    setProfile(data.profile);
    toast.success("Facial verification mock completed");
  }

  return (
    <main className="page">
      <div>
        <p className="text-sm font-black uppercase text-cyan-400">Digital identity</p>
        <h1 className="text-3xl font-black">Tourist ID and QR profile</h1>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="card grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="label">Nationality<input className="input" name="nationality" defaultValue={profile?.nationality || "Indian"} required /></label>
            <label className="label">Identity type<select className="input" name="identityType" defaultValue={profile?.identityType || "passport"}><option value="passport">Passport</option><option value="aadhaar">Aadhaar</option><option value="other">Other</option></select></label>
            <label className="label">Passport/Aadhaar<input className="input" name="identityNumber" required /></label>
            <label className="label">Blood group<input className="input" name="bloodGroup" defaultValue={profile?.bloodGroup || "O+"} /></label>
            <label className="label">Hotel name<input className="input" name="hotelName" defaultValue={profile?.hotel?.name || "SafeStay Hotel"} /></label>
            <label className="label">Hotel phone<input className="input" name="hotelPhone" defaultValue={profile?.hotel?.phone || "011-1111-2222"} /></label>
            <label className="label sm:col-span-2">Hotel address<input className="input" name="hotelAddress" defaultValue={profile?.hotel?.address || "Central Tourist District"} /></label>
            <label className="label">Itinerary place<input className="input" name="itineraryPlace" defaultValue="Heritage Fort" /></label>
            <label className="label">Itinerary city<input className="input" name="itineraryCity" defaultValue="Delhi" /></label>
            <label className="label">Travel start<input className="input" name="travelStart" type="datetime-local" required /></label>
            <label className="label">Travel end<input className="input" name="travelEnd" type="datetime-local" required /></label>
          </div>
          <button className="btn-primary w-fit">Generate tourist identity</button>
        </form>

        <aside className="card grid content-start justify-items-center gap-4 text-center">
          {profile ? (
            <>
              <QRCodeSVG value={profile.qrPayload || profile.touristId} size={190} />
              <div>
                <p className="text-sm text-slate-500">Tourist ID</p>
                <h2 className="text-2xl font-black">{profile.touristId}</h2>
              </div>
              <p className="break-all text-xs text-slate-500">Blockchain mock hash: {profile.blockchainHash}</p>
              <button className="btn-secondary" onClick={verifyFace}><Fingerprint size={18} /> Facial verification mock</button>
              <p className="flex items-center gap-2 text-sm font-bold text-safety-green"><BadgeCheck size={18} /> Trust score {profile.trustScore}/100</p>
            </>
          ) : (
            <p className="text-slate-500">Create your profile to generate a temporary travel QR identity.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
