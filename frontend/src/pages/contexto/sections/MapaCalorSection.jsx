import { useState } from "react";
import ParametroFijo from "../components/ParametroFijo";
import Callout from "../components/Callout";

const CELL_COLOR = {
  "CRÍTICO": "bg-red-500 text-white",
  "ALTO": "bg-orange-400 text-white",
  "MEDIO": "bg-yellow-300 text-yellow-900",
  "BAJO": "bg-green-200 text-green-900",
};

const PLAZO = {
  "CRÍTICO": "Tratamiento inmediato < 30 días",
  "ALTO": "Plan de tratamiento < 90 días",
  "MEDIO": "Monitoreo semestral",
  "BAJO": "Revisión anual",
};

export default function MapaCalorSection({ mapa }) {
  const [hover, setHover] = useState(null);
  if (!mapa) return null;

  // Indexa celdas por "P-I" → {valor, nivel}
  const byPI = {};
  (mapa.celdas || []).forEach(([p, i, v, n]) => { byPI[`${p}-${i}`] = { v, n }; });

  return (
    <section id="mapa-calor" className="space-y-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-brand-900">4.4.2 · Mapa de calor 5×5</h2>
          <p className="text-sm text-slate-500">{mapa.descripcion}</p>
          <p className="mt-1 font-mono text-xs text-slate-400">{mapa.formula}</p>
        </div>
        <ParametroFijo />
      </div>

      {/* Mapa */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="inline-block">
          <div className="flex">
            <div className="w-28" />
            <div className="grid grid-cols-5 gap-1.5 text-center text-[11px] font-semibold text-slate-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-24">I={i}<br /><span className="font-normal text-slate-400">{mapa.leyenda_i[i]}</span></div>
              ))}
            </div>
          </div>
          {[5, 4, 3, 2, 1].map((p) => (
            <div key={p} className="mt-1.5 flex items-center">
              <div className="w-28 pr-2 text-right text-[11px] font-semibold text-slate-500">
                P={p}<br /><span className="font-normal text-slate-400">{mapa.leyenda_p[p]}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => {
                  const c = byPI[`${p}-${i}`];
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHover({ p, i, ...c })}
                      onMouseLeave={() => setHover(null)}
                      className={`grid h-16 w-24 cursor-default place-items-center rounded-lg text-lg font-black transition hover:scale-105 hover:ring-2 hover:ring-brand-500 ${CELL_COLOR[c.n]}`}
                    >
                      {c.v}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {hover && (
          <div className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">
            P={hover.p}, I={hover.i} → RR={hover.v} · <b>{hover.n}</b> · {PLAZO[hover.n]}
          </div>
        )}
      </div>

      {/* Ejemplo del PDF */}
      <Callout tono="info" titulo="Ejemplo del documento">
        Ransomware sobre BD pacientes (INF-001) con P=4 (Alta, λ≈3.9/año) e I=5 (Muy Alto, &gt; $500K) → celda
        P=4, I=5 → RR=20 → <b>CRÍTICO</b>. Exige tratamiento inmediato en menos de 30 días. Validado con
        ALE_PERT = $1.74M (P90: $3.1M) en Monte Carlo.
      </Callout>

      {/* Leyenda de plazos */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["🔴", "20–25 CRÍTICO", "< 30 días", "bg-red-50 text-red-700 border-red-200"],
          ["🟠", "12–19 ALTO", "< 90 días", "bg-orange-50 text-orange-700 border-orange-200"],
          ["🟡", "6–11 MEDIO", "Semestral", "bg-yellow-50 text-yellow-700 border-yellow-200"],
          ["🟢", "1–5 BAJO", "Anual", "bg-green-50 text-green-700 border-green-200"],
        ].map(([emoji, nivel, plazo, cls]) => (
          <div key={nivel} className={`rounded-xl border p-3 text-center text-xs ${cls}`}>
            <p className="text-base">{emoji}</p>
            <p className="font-bold">{nivel}</p>
            <p>{plazo}</p>
          </div>
        ))}
      </div>

      <Callout tono="info" titulo="Dónde se usa esto →">
        Fase 4 (ubicación de escenarios) y Dashboard (resumen ejecutivo).
      </Callout>
    </section>
  );
}
