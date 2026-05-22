import { Siren } from "lucide-react";

export default function SosButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="grid aspect-square w-44 place-items-center rounded-full bg-red-600 text-white shadow-[0_20px_45px_rgba(220,38,38,0.35)] transition hover:scale-[1.02] active:scale-95"
    >
      <span className="grid place-items-center gap-1">
        <Siren size={34} />
        <strong className="text-4xl font-black">SOS</strong>
        <small className="font-bold">{loading ? "Sending" : "Hold safe"}</small>
      </span>
    </button>
  );
}
