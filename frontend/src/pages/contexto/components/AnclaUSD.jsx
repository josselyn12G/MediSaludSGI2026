// Chip que muestra un ancla económica en USD de forma consistente.
export default function AnclaUSD({ valor, tono = "neutral" }) {
  const tonos = {
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    red: "bg-red-100 text-red-800 border-red-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    green: "bg-green-100 text-green-800 border-green-200",
    gray: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };
  return (
    <span className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${tonos[tono] || tonos.neutral}`}>
      {valor}
    </span>
  );
}
