import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BellRing, MapPinned, ShieldCheck, Siren } from "lucide-react";

const features = [
  { icon: MapPinned, title: "Live location", text: "Track GPS movement and nearby help points on an OpenStreetMap map." },
  { icon: Siren, title: "SOS response", text: "Send location, identity, and alerts to trusted contacts and admins." },
  { icon: BellRing, title: "Realtime alerts", text: "Receive nearby danger alerts through Socket.IO events." },
  { icon: ShieldCheck, title: "Trip check-ins", text: "Optional timer can trigger SOS if the tourist misses safety confirmation." }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl content-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="self-center">
          <p className="text-sm font-black uppercase text-emerald-300">Smart tourist safety system</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-none sm:text-7xl">
            SafeTour AI for government-grade tourist protection.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Digital Tourist ID, geo-fencing, danger heatmaps, SOS broadcasts,
            tourist-only reviews, realtime response, and AI safety guidance in one platform.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/register">Create account</Link>
            <Link className="btn-secondary border-slate-700 bg-slate-900 text-white hover:bg-slate-800" to="/login">Login</Link>
          </div>
        </motion.div>
        <div className="grid gap-4">
          {features.map(({ icon: Icon, title, text }) => (
            <motion.article initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} key={title} className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Icon className="text-emerald-300" />
              <h2 className="mt-3 text-xl font-black">{title}</h2>
              <p className="mt-2 text-slate-300">{text}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
