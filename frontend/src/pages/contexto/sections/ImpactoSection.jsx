import ParametroFijo from "../components/ParametroFijo";
import NivelBadge from "../components/NivelBadge";
import AnclaUSD from "../components/AnclaUSD";
import Callout from "../components/Callout";

const fUSD = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

export default function ImpactoSection({ impacto = [] }) {
  return (
    <section id="impacto" className="space-y-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-brand-900">4.2 · Criterios de impacto CIA</h2>
          <p className="text-sm text-slate-500">
            Consecuencias esperadas por dimensión (Confidencialidad, Integridad, Disponibilidad) con anclas en USD.
          </p>
        </div>
        <ParametroFijo />
      </div>

      {/* Bloque 1: Tabla de impacto CIA */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">Nivel</th><th className="px-3 py-3 text-center">Valor</th>
              <th className="px-3 py-3">Descriptor</th>
              <th className="px-3 py-3">[C] Confidencialidad</th>
              <th className="px-3 py-3">[I] Integridad</th>
              <th className="px-3 py-3">[D] Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {impacto.map((r) => (
              <tr key={r.valor} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3"><NivelBadge nivel={r.nivel} /></td>
                <td className="px-3 py-3 text-center text-lg font-black text-brand-700">{r.valor}</td>
                <td className="px-3 py-3 font-semibold text-slate-700">{r.descriptor}</td>
                {["confidencialidad", "integridad", "disponibilidad"].map((dim) => (
                  <td key={dim} className="px-3 py-3 text-slate-600">
                    <p className="mb-1.5">{r[dim].descripcion}</p>
                    <AnclaUSD valor={r[dim].ancla_usd} tono={r.color} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bloque 2: PERT por nivel de impacto */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-brand-800">Mapeo a Distribuciones PERT para Monte Carlo (§4.2.1)</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2.5">Niv.</th><th className="px-3 py-2.5 text-center">Val.</th>
                <th className="px-3 py-2.5">Distribución LM</th>
                <th className="px-3 py-2.5 text-right">LM Optimista</th>
                <th className="px-3 py-2.5 text-right">LM Más Probable</th>
                <th className="px-3 py-2.5 text-right">LM Pesimista</th>
                <th className="px-3 py-2.5">Uso en MC</th>
              </tr>
            </thead>
            <tbody>
              {impacto.map((r) => (
                <tr key={r.valor} className="border-t border-slate-100">
                  <td className="px-3 py-2.5"><NivelBadge nivel={r.nivel} /></td>
                  <td className="px-3 py-2.5 text-center font-black text-brand-700">{r.valor}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                    PERT({fUSD(r.pert_loss.optimista)}, {fUSD(r.pert_loss.mas_probable)}, {fUSD(r.pert_loss.pesimista)})
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600">${r.pert_loss.optimista.toLocaleString("es-EC")}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-700">${r.pert_loss.mas_probable.toLocaleString("es-EC")}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">${r.pert_loss.pesimista.toLocaleString("es-EC")}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{r.uso_mc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloque 3: integración multidimensional */}
      <Callout tono="info" titulo="Integración multidimensional">
        Una amenaza puede afectar simultáneamente C, I y D. La magnitud total se calcula como{" "}
        <span className="font-mono font-semibold">LM_Total = LM_C + LM_I + LM_D</span>. Cada dimensión usa su
        propia distribución Beta-PERT independiente.
      </Callout>

      {/* Bloque 4: regla LOPDP */}
      <Callout tono="danger" titulo="⚠ Regla LOPDP">
        Todo activo que procese datos de salud de pacientes recibe automáticamente nivel <b>MA (5)</b> en
        Confidencialidad. Este valor no puede ser reducido sin justificación escrita aprobada por el Responsable
        de Protección de Datos.
      </Callout>

      <Callout tono="info" titulo="Dónde se usa esto →">
        Módulo Activos (valoración C/I/D) y Fase 3 (LM_PERT por escenario).
      </Callout>
    </section>
  );
}
