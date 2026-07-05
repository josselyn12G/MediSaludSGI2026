// Badge de color por nivel de criticidad o nivel CIA (1–5).
const COLORES = {
  "CRÍTICO": "bg-red-100 text-red-800 border-red-300",
  "ALTO": "bg-orange-100 text-orange-800 border-orange-300",
  "MEDIO": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "BAJO": "bg-green-100 text-green-800 border-green-300",
  MA: "bg-red-100 text-red-800 border-red-300",
  A: "bg-orange-100 text-orange-800 border-orange-300",
  M: "bg-yellow-100 text-yellow-800 border-yellow-300",
  B: "bg-green-100 text-green-800 border-green-300",
  MB: "bg-neutral-100 text-neutral-700 border-neutral-300",
};

export default function NivelBadge({ nivel, children }) {
  const cls = COLORES[nivel] || "bg-neutral-100 text-neutral-700 border-neutral-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {children || nivel}
    </span>
  );
}
