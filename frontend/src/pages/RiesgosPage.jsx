import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEscenarioRiesgoStats, fetchEscenariosRiesgo } from "../api/resources";
import { formatUSD } from "../data/metodologia";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import EscenarioDetalle from "../components/EscenarioDetalle";
import AccionesEscenario from "../components/AccionesEscenario";

const NIVEL_CLS = {
  critico: "bg-red-100 text-red-800", alto: "bg-orange-100 text-orange-800",
  medio: "bg-yellow-100 text-yellow-800", bajo: "bg-green-100 text-green-800",
};

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl ${accent} text-white`}><Icon name={icon} className="h-6 w-6" /></div>
      <p className="text-2xl font-black text-brand-900">{value}</p><p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

const fmtFecha = (iso) => (iso ? new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");

export default function RiesgosPage() {
  const [sel, setSel] = useState(null);
  const [dirFecha, setDirFecha] = useState("desc");
  const { data: escenarios } = useQuery({ queryKey: ["escenarios-riesgo"], queryFn: () => fetchEscenariosRiesgo() });
  const { data: stats } = useQuery({ queryKey: ["escenario-riesgo-stats"], queryFn: fetchEscenarioRiesgoStats });
  const rows = [...(escenarios || [])].sort(
    (a, b) => (new Date(a.creado_en) - new Date(b.creado_en)) * (dirFecha === "asc" ? 1 : -1)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-black text-brand-900">Escenarios de Riesgo</h1>
          <p className="text-slate-500">Fase 3-4 · RI=VA×P×D · RR=RI×FRC · ALE con Monte Carlo</p></div>
        <Link to="/escenarios/nuevo" className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"><Icon name="spark" className="h-4 w-4" /> Nuevo escenario</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="calc" label="Escenarios" value={stats?.total ?? "—"} accent="bg-brand-600" />
        <StatCard icon="threats" label="Críticos" value={stats?.criticos ?? "—"} accent="bg-red-500" />
        <StatCard icon="bolt" label="Altos" value={stats?.altos ?? "—"} accent="bg-orange-500" />
        <StatCard icon="chart" label="ALE_PERT total" value={formatUSD(stats?.ale_total)} accent="bg-neutral-800" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Escenario</th><th className="px-4 py-3 text-center">RR</th>
              <th className="px-4 py-3">Nivel</th><th className="px-4 py-3 text-right">ALE_PERT</th><th className="px-4 py-3 text-right">ALE_P90</th>
              <th className="px-4 py-3">Estrategia</th><th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"><button onClick={() => setDirFecha((d) => (d === "asc" ? "desc" : "asc"))} className="flex items-center gap-1 uppercase hover:text-brand-600" title="Ordenar por fecha de creación">Creado {dirFecha === "asc" ? "↑" : "↓"}</button></th>
              <th className="px-4 py-3 text-right">Acc.</th></tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className={`border-t border-slate-100 ${e.nivel === "critico" ? "bg-red-50/30" : ""}`}>
                <td className="px-4 py-3 font-mono font-bold text-brand-700">{e.codigo || `#${e.id}`}</td>
                <td className="px-4 py-3"><p className="font-medium text-slate-800">{e.activo_codigo} · {e.amenaza_codigo}×{e.vulnerabilidad_codigo}</p><p className="text-[11px] text-slate-400">{e.activo_nombre}</p></td>
                <td className="px-4 py-3 text-center font-black text-brand-900">{e.rr_simple}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${NIVEL_CLS[e.nivel]}`}>{e.nivel}</span></td>
                <td className="px-4 py-3 text-right font-semibold text-slate-700">{formatUSD(e.ale_pert_usd)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatUSD(e.ale_p90_usd)}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{e.estrategia_tratamiento || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{e.estado_display}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmtFecha(e.creado_en)}</td>
                <td className="px-4 py-3"><AccionesEscenario e={e} onVer={() => setSel({ esc: e, edit: false })} onEditar={() => setSel({ esc: e, edit: true })} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">Sin escenarios. Crea uno con “Nuevo escenario”.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} wide expandable title={sel ? `${sel.esc.codigo || "Escenario"} · detalle` : ""}>
        {sel && <EscenarioDetalle esc={sel.esc} startEdit={sel.edit} onClose={() => setSel(null)} />}
      </Modal>
    </div>
  );
}
