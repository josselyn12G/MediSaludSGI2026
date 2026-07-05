import { NIVEL_STYLES } from "../data/metodologia";

export default function Badge({ nivel }) {
  const cls = NIVEL_STYLES[nivel] || "bg-slate-100 text-slate-700 border-slate-300";
  const dot = {
    "Crítico": "bg-red-500",
    "Alto": "bg-orange-500",
    "Medio": "bg-yellow-500",
    "Bajo": "bg-green-500",
  }[nivel] || "bg-slate-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {nivel || "—"}
    </span>
  );
}
