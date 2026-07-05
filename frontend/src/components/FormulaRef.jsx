// Tarjeta de fórmula con leyenda: muestra la fórmula y qué significa cada variable.
// Reutilizada en Contexto, Amenazas/Vulnerabilidades y Riesgos (Monte Carlo).
export default function FormulaRef({ titulo, fase, formula, descripcion, variables = [], fuente }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-brand-900">{titulo}</h3>
        {fase && (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
            {fase}
          </span>
        )}
      </div>

      {/* Fórmula destacada */}
      <pre className="mb-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-neutral-900 px-3 py-2.5 font-mono text-sm font-semibold text-cyan-300">
        {formula}
      </pre>

      {descripcion && <p className="mb-3 text-sm text-slate-600">{descripcion}</p>}

      {/* Leyenda de variables */}
      {variables.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2.5 py-1.5">Símbolo</th>
                <th className="px-2.5 py-1.5">Significado</th>
                <th className="px-2.5 py-1.5">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((v) => (
                <tr key={v.sim} className="border-t border-slate-100 align-top">
                  <td className="px-2.5 py-1.5 font-mono font-bold text-brand-700 whitespace-nowrap">{v.sim}</td>
                  <td className="px-2.5 py-1.5 font-semibold text-slate-700 whitespace-nowrap">{v.nombre}</td>
                  <td className="px-2.5 py-1.5 text-slate-500">{v.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fuente && (
        <p className="mt-3 flex gap-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500">¿De dónde salen los datos?</span> {fuente}
        </p>
      )}
    </div>
  );
}
