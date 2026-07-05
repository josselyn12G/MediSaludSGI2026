// Recuadro informativo. Tonos en la paleta del sistema (sin azul/morado).
const TONOS = {
  info: "border-neutral-300 bg-neutral-50 text-neutral-700",
  danger: "border-red-300 bg-red-50 text-red-800",
  warn: "border-orange-300 bg-orange-50 text-orange-800",
  amber: "border-yellow-300 bg-yellow-50 text-yellow-800",
  success: "border-green-300 bg-green-50 text-green-800",
};

export default function Callout({ tono = "info", titulo, children, icon }) {
  return (
    <div className={`rounded-xl border-l-4 p-4 text-sm ${TONOS[tono] || TONOS.info}`}>
      {titulo && (
        <p className="mb-1 flex items-center gap-2 font-bold">
          {icon && <span>{icon}</span>}
          {titulo}
        </p>
      )}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
