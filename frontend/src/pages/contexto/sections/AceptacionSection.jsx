import ParametroFijo from "../components/ParametroFijo";
import NivelBadge from "../components/NivelBadge";
import Callout from "../components/Callout";

const VARIABLES = [
  ["VA", "1 – 5", "Valor del Activo, normalizado desde VAG/VAD (Fase 2)."],
  ["P (TEF)", "1 – 5", "Probabilidad anualizada TEF_PERT (Fase 3)."],
  ["D (Degradación)", "0.20 – 1.00", "Fracción del valor que se pierde al explotar la vulnerabilidad."],
  ["FRC", "1.0 / 0.6 / 0.3", "Factor de Reducción del Control: ausente / parcial / implementado."],
  ["RR_simple", "1 – 25", "P × I, posición visual en el mapa de calor 5×5."],
];

export default function AceptacionSection({ aceptacion = [] }) {
  return (
    <section id="aceptacion" className="space-y-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-brand-900">4.4 · Criterios de aceptación del riesgo</h2>
          <p className="text-sm text-slate-500">Umbrales de decisión que determinan cuándo se acepta o se trata un riesgo.</p>
        </div>
        <ParametroFijo />
      </div>

      {/* Bloque 1: RI vs RR */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-brand-900">Riesgo Intrínseco (RI)</p>
          <p className="mt-1 text-sm text-slate-500">Exposición inherente antes de controles.</p>
          <pre className="mt-3 rounded-lg bg-neutral-900 px-3 py-2 font-mono text-sm font-semibold text-cyan-300">RI = VA × P × D</pre>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-brand-900">Riesgo Residual (RR)</p>
          <p className="mt-1 text-sm text-slate-500">Riesgo remanente tras aplicar controles.</p>
          <pre className="mt-3 rounded-lg bg-neutral-900 px-3 py-2 font-mono text-sm font-semibold text-cyan-300">RR = RI × FRC</pre>
        </div>
      </div>

      {/* Bloque 2: variables */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr><th className="px-4 py-2.5">Variable</th><th className="px-4 py-2.5">Rango / Valores</th><th className="px-4 py-2.5">Descripción para Medisalud</th></tr>
          </thead>
          <tbody>
            {VARIABLES.map(([v, r, d]) => (
              <tr key={v} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-mono font-bold text-brand-700">{v}</td>
                <td className="px-4 py-2.5 font-semibold text-slate-700">{r}</td>
                <td className="px-4 py-2.5 text-slate-600">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bloque 3: umbrales */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-brand-800">Tabla de umbrales — Criterios de aceptación del riesgo</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-3 text-center">Puntuación RR</th><th className="px-3 py-3">Nivel</th>
                <th className="px-3 py-3">ALE_P90 esperado</th><th className="px-3 py-3">Estado vs. criterio</th>
                <th className="px-3 py-3">Respuesta requerida</th><th className="px-3 py-3">Plazo máximo</th>
              </tr>
            </thead>
            <tbody>
              {aceptacion.map((a) => (
                <tr key={a.nivel} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-3 text-center font-black text-brand-900">{a.rango_min}–{a.rango_max}</td>
                  <td className="px-3 py-3"><NivelBadge nivel={a.nivel} /></td>
                  <td className="px-3 py-3 font-semibold text-slate-700">{a.ale_p90_esperado}</td>
                  <td className="px-3 py-3 text-slate-600">{a.estado}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{a.respuesta}</td>
                  <td className="px-3 py-3"><NivelBadge nivel={a.nivel}>{a.plazo}</NivelBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloque 4 + 5: callouts */}
      <Callout tono="amber" titulo="Flexibilidad para riesgos MEDIO">
        Si el costo anualizado del control supera el ALE_P50 de Monte Carlo, la Gerencia Administrativa puede
        aprobar formalmente la aceptación con justificación documentada. No aplica a riesgos CRÍTICOS o ALTOS.
      </Callout>

      <Callout tono="warn" titulo="⚠ Punto de decisión ISO 27005:2022">
        Si el RR calculado supera los criterios de aceptación, el proceso REGRESA a la Fase 2 (Identificación de
        Riesgos) para revisar activos, amenazas, vulnerabilidades o controles.
      </Callout>

      <Callout tono="info" titulo="Dónde se usa esto →">
        Fase 4 (priorización de escenarios) y Fase 5 (decisión de tratamiento).
      </Callout>
    </section>
  );
}
