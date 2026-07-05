import { useState } from "react";

// Tarjeta de fórmula interactiva: título, fórmula, valores sustituidos y
// parámetros con "ver más" (clic) que explica de dónde sale cada dato.
export default function WizardFormula({ titulo, formula, sustitucion, params = [] }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-500">{titulo}</p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-brand-50 px-3 py-2.5 font-mono text-sm font-bold text-brand-800">{formula}</pre>
      {sustitucion && <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">{sustitucion}</pre>}
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {params.map((p) => {
          const abierto = open === p.sim;
          return (
            <button key={p.sim} onClick={() => setOpen(abierto ? null : p.sim)} title={p.fuente}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${abierto ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/40"}`}>
              <span className="flex items-center justify-between gap-2">
                <span><b className="font-mono text-brand-700">{p.sim}</b> <span className="text-slate-500">{p.sig}</span>{p.val !== undefined && <span className="ml-1 font-mono text-slate-400">= {p.val}</span>}</span>
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>{abierto ? "expand_less" : "info"}</span>
              </span>
              {abierto && <span className="mt-1 block text-[11px] leading-snug text-slate-500">{p.fuente}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
