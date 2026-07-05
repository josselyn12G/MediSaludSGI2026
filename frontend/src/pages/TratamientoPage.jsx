import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEscenariosRiesgo } from "../api/resources";
import { formatUSD } from "../data/metodologia";
import Modal from "../components/Modal";
import EscenarioDetalle from "../components/EscenarioDetalle";
import AccionesEscenario from "../components/AccionesEscenario";

const NIVEL_CLS = {
  critico: "bg-red-100 text-red-800", alto: "bg-orange-100 text-orange-800",
  medio: "bg-yellow-100 text-yellow-800", bajo: "bg-green-100 text-green-800",
};

const fmtFecha = (iso) => (iso ? new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");

export default function TratamientoPage() {
  const [sel, setSel] = useState(null);
  const [dirFecha, setDirFecha] = useState("desc");
  const { data: escenarios } = useQuery({ queryKey: ["escenarios-riesgo"], queryFn: () => fetchEscenariosRiesgo() });
  const planes = (escenarios || [])
    .filter((e) => e.estrategia_tratamiento)
    .sort((a, b) => (new Date(a.creado_en) - new Date(b.creado_en)) * (dirFecha === "asc" ? 1 : -1));
  const costo = planes.reduce((s, e) => s + (e.costo_control_estimado_usd || 0), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-brand-900">Planes de Tratamiento</h1>
        <p className="text-slate-500">Fase 5 · estrategia, controles y decisión por escenario · editable</p></div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-2xl font-black text-brand-900">{planes.length}</p><p className="text-sm text-slate-500">Con tratamiento</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-2xl font-black text-brand-900">{planes.filter((e) => e.estrategia_tratamiento === "mitigar").length}</p><p className="text-sm text-slate-500">Mitigar</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-2xl font-black text-brand-900">{planes.filter((e) => e.estrategia_tratamiento === "transferir").length}</p><p className="text-sm text-slate-500">Transferir</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-2xl font-black text-brand-900">{formatUSD(costo)}</p><p className="text-sm text-slate-500">Costo estimado/año</p></div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Escenario</th><th className="px-4 py-3">Estrategia</th><th className="px-4 py-3">Controles</th>
              <th className="px-4 py-3 text-right">Costo/año</th><th className="px-4 py-3 text-right">ALE_PERT</th><th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3"><button onClick={() => setDirFecha((d) => (d === "asc" ? "desc" : "asc"))} className="flex items-center gap-1 uppercase hover:text-brand-600" title="Ordenar por fecha de creación">Creado {dirFecha === "asc" ? "↑" : "↓"}</button></th>
              <th className="px-4 py-3 text-right">Acc.</th></tr>
          </thead>
          <tbody>
            {planes.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono font-bold text-brand-700">{e.codigo || `#${e.id}`}</td>
                <td className="px-4 py-3"><b className="font-mono text-brand-700">{e.amenaza_codigo}×{e.vulnerabilidad_codigo}</b><p className="text-[11px] text-slate-400">{e.activo_codigo}</p></td>
                <td className="px-4 py-3 capitalize font-semibold text-slate-700">{e.estrategia_tratamiento}</td>
                <td className="px-4 py-3 text-[11px] text-slate-400">{(e.controles_info || []).map((c) => c.codigo).join(", ") || "—"}</td>
                <td className="px-4 py-3 text-right">{e.costo_control_estimado_usd ? formatUSD(e.costo_control_estimado_usd) : "—"}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatUSD(e.ale_pert_usd)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${NIVEL_CLS[e.nivel]}`}>{e.nivel}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmtFecha(e.creado_en)}</td>
                <td className="px-4 py-3"><AccionesEscenario e={e} onVer={() => setSel({ esc: e, edit: false })} onEditar={() => setSel({ esc: e, edit: true })} /></td>
              </tr>
            ))}
            {planes.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Sin tratamientos. Complétalos desde el wizard o en Riesgos.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} wide expandable title={sel ? `${sel.esc.amenaza_codigo}×${sel.esc.vulnerabilidad_codigo} · tratamiento` : ""}>
        {sel && <EscenarioDetalle esc={sel.esc} startEdit={sel.edit} onClose={() => setSel(null)} />}
      </Modal>
    </div>
  );
}
