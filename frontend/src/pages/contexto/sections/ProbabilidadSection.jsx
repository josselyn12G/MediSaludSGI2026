import ParametroFijo from "../components/ParametroFijo";
import NivelBadge from "../components/NivelBadge";
import Callout from "../components/Callout";

export default function ProbabilidadSection({ probabilidad = [] }) {
  return (
    <section id="probabilidad" className="space-y-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-brand-900">4.3 · Criterios de probabilidad TEF</h2>
          <p className="text-sm text-slate-500">Frecuencia anualizada de eventos (FAIR) con estimación PERT de 3 puntos.</p>
        </div>
        <ParametroFijo />
      </div>

      <Callout tono="info" titulo="¿Qué es TEF y PERT?">
        La probabilidad se representa como <b>TEF (Threat Event Frequency)</b> anualizada. La incertidumbre se
        modela con estimación PERT de 3 puntos:{" "}
        <span className="font-mono font-semibold">T_PERT = (T_O + 4×T_m + T_P) / 6</span>.
      </Callout>

      {/* Bloque 2: escala de probabilidad */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">Nivel</th><th className="px-3 py-3 text-center">Valor</th>
              <th className="px-3 py-3">Descriptor</th>
              <th className="px-3 py-3 text-right">TEF O</th><th className="px-3 py-3 text-right">TEF MP</th>
              <th className="px-3 py-3 text-right">TEF P</th><th className="px-3 py-3 text-right">TEF_PERT</th>
              <th className="px-3 py-3">Cuándo se actualiza</th>
            </tr>
          </thead>
          <tbody>
            {probabilidad.map((r) => (
              <tr key={r.valor} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3"><NivelBadge nivel={r.nivel === "Muy Alta" ? "CRÍTICO" : r.nivel === "Alta" ? "ALTO" : r.nivel === "Media" ? "MEDIO" : "BAJO"}>{r.nivel}</NivelBadge></td>
                <td className="px-3 py-3 text-center text-lg font-black text-brand-700">{r.valor}</td>
                <td className="px-3 py-3 text-slate-600">{r.descriptor}</td>
                <td className="px-3 py-3 text-right text-slate-500">{r.tef_o}</td>
                <td className="px-3 py-3 text-right text-slate-500">{r.tef_mp}</td>
                <td className="px-3 py-3 text-right text-slate-500">{r.tef_p}</td>
                <td className="px-3 py-3 text-right font-black text-slate-800">{r.tef_pert}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{r.cuando_actualiza}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bloque 3: tabla consolidada Monte Carlo */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-brand-800">Parámetros de entrada para Simulación Monte Carlo (§6.4)</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2.5">Nivel</th><th className="px-3 py-2.5">Descriptor</th>
                <th className="px-3 py-2.5 text-right">TEF_O</th><th className="px-3 py-2.5 text-right">TEF_MP</th>
                <th className="px-3 py-2.5 text-right">TEF_P</th><th className="px-3 py-2.5 text-right">TEF_PERT</th>
                <th className="px-3 py-2.5 text-right">LM_PERT</th><th className="px-3 py-2.5">Distribución Beta-PERT</th>
              </tr>
            </thead>
            <tbody>
              {probabilidad.map((r) => (
                <tr key={r.valor} className="border-t border-slate-100">
                  <td className="px-3 py-2.5"><NivelBadge nivel={r.nivel === "Muy Alta" ? "CRÍTICO" : r.nivel === "Alta" ? "ALTO" : r.nivel === "Media" ? "MEDIO" : "BAJO"}>{r.nivel}</NivelBadge></td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{r.descriptor}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500">{r.tef_o}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500">{r.tef_mp}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500">{r.tef_p}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-700">{r.tef_pert}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-brand-700">${r.lm_pert_usd.toLocaleString("es-EC")}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{r.distribucion_mc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Callout tono="info" titulo="Dónde se usa esto →">
        Fase 3 (TEF_PERT por escenario) y Fase 4 (posición en el mapa de calor).
      </Callout>
    </section>
  );
}
