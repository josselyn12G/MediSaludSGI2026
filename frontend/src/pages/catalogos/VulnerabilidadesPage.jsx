import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVulnerabilidad, deleteVulnerabilidad, fetchAmenazas, fetchOrganizaciones,
  fetchVulnerabilidades, updateVulnerabilidad,
} from "../../api/resources";
import { ESCALA_DEGRADACION, GRUPOS_VULN, VALOR_HEAT } from "../../data/metodologia";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import VulnerabilidadForm from "../../components/VulnerabilidadForm";

const TABS = [["", "Todas"], ["VT", "VT · Tecnológicas"], ["VO", "VO · Organizacionales"], ["VP", "VP · Proceso"]];

function HeatCell({ valor, children }) {
  const h = VALOR_HEAT[valor] || VALOR_HEAT[3];
  return <span className={`inline-grid h-7 min-w-[2rem] place-items-center rounded-md px-1.5 text-xs font-black text-white ${h.bg}`}>{children}</span>;
}

export default function VulnerabilidadesPage() {
  const qc = useQueryClient();
  const [grupo, setGrupo] = useState("");
  const [modal, setModal] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [showRef, setShowRef] = useState(false);

  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;
  const { data: vulns } = useQuery({ queryKey: ["vulnerabilidades"], queryFn: () => fetchVulnerabilidades() });
  const { data: amenazas = [] } = useQuery({ queryKey: ["amenazas"], queryFn: () => fetchAmenazas() });

  const inv = () => qc.invalidateQueries({ queryKey: ["vulnerabilidades"] });
  const mut = useMutation({
    mutationFn: ({ id, p }) => (id ? updateVulnerabilidad(id, p) : createVulnerabilidad(p)),
    onSuccess: () => { inv(); setModal(null); },
  });
  const del = useMutation({ mutationFn: deleteVulnerabilidad, onSuccess: inv });

  const rows = useMemo(() => (vulns || []).filter((v) => !grupo || v.grupo === grupo), [vulns, grupo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Catálogo de Vulnerabilidades</h1>
          <p className="text-slate-500">MAGERIT §5.3 · 21 vulnerabilidades · Severidad → Degradación D</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRef((s) => !s)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Icon name="doc" className="h-4 w-4" /> Tablas de referencia
          </button>
          <button onClick={() => setModal({ editing: null })} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700">
            <Icon name="spark" className="h-4 w-4" /> Registrar nueva vulnerabilidad
          </button>
        </div>
      </div>

      {showRef && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
          <h3 className="font-bold text-brand-900">Severidad → Degradación D (§5.3)</h3>
          <p className="mb-3 mt-1 text-xs text-slate-500">
            D es la fracción del valor del activo que se pierde cuando la vulnerabilidad es explotada. Las anclas económicas
            corresponden a la escala cuantitativa de valoración (§5.1.5): pérdida estimada ≈ D × valor del activo.
          </p>
          <div className="overflow-x-auto rounded-lg border border-brand-100 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-2 py-1.5">Severidad</th><th className="px-2 py-1.5 text-center">Valor</th><th className="px-2 py-1.5 text-center">D</th><th className="px-2 py-1.5">Pérdida del activo</th><th className="px-2 py-1.5">Ancla económica (USD)</th><th className="px-2 py-1.5">Criterio de asignación para Medisalud</th></tr>
              </thead>
              <tbody>
                {ESCALA_DEGRADACION.map((r) => (
                  <tr key={r.severidad} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-1.5"><span className={`whitespace-nowrap rounded px-2 py-0.5 font-bold ${VALOR_HEAT[r.severidad].soft} ${VALOR_HEAT[r.severidad].text}`}>{r.sev}</span></td>
                    <td className="px-2 py-1.5 text-center"><HeatCell valor={r.severidad}>{r.severidad}</HeatCell></td>
                    <td className="px-2 py-1.5 text-center font-black text-brand-900">{r.d.toFixed(2)}</td>
                    <td className="px-2 py-1.5 font-semibold text-slate-700">{r.perdida}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-600">{r.ancla}</td>
                    <td className="px-2 py-1.5 text-slate-500">{r.criterio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map(([g, l]) => (
          <button key={g} onClick={() => setGrupo(g)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${grupo === g ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">ID</th><th className="px-3 py-3">Vulnerabilidad</th>
              <th className="px-3 py-3 text-center">Sev.</th><th className="px-3 py-3 text-center">D</th>
              <th className="px-3 py-3">CIA</th><th className="px-3 py-3">Amenazas asociadas</th>
              <th className="px-3 py-3 text-center">Origen</th><th className="px-3 py-3 text-right">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} onClick={() => setDetalle(v)} className="cursor-pointer border-t border-slate-100 hover:bg-brand-50/40">
                <td className="px-3 py-2.5 font-mono font-bold text-brand-700">{v.codigo}</td>
                <td className="px-3 py-2.5"><p className="font-medium text-slate-800">{v.nombre}</p><p className="text-[11px] text-slate-400">{v.descripcion}</p></td>
                <td className="px-3 py-2.5 text-center"><HeatCell valor={v.severidad}>{v.severidad}</HeatCell></td>
                <td className="px-3 py-2.5 text-center font-black text-slate-700">{v.degradacion?.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{v.cia || "—"}</td>
                <td className="px-3 py-2.5 text-[11px] text-slate-400">{(v.amenazas_codigos || []).join(", ") || "—"}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${v.precargada ? "bg-slate-100 text-slate-500" : "bg-brand-100 text-brand-700"}`}>
                    {v.precargada ? "Catálogo" : "Personalizada"}
                  </span>
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setDetalle(v)} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Ver"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span></button>
                    <button onClick={() => setModal({ editing: v })} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Editar"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span></button>
                    <button onClick={() => { if (confirm(`¿Eliminar ${v.codigo}?`)) del.mutate(v.id); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">Sin vulnerabilidades para este filtro.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border-l-4 border-neutral-300 bg-neutral-50 p-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">Se usa en:</span> el wizard (Paso 3) y la fórmula <b>RI = VA × P × D</b> (Fase 3).
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} wide expandable title={modal?.editing ? "Editar vulnerabilidad" : "Nueva vulnerabilidad"}>
        {modal && orgId && (
          <VulnerabilidadForm initial={modal.editing} organizacionId={orgId} amenazas={amenazas} submitting={mut.isPending}
            onCancel={() => setModal(null)} onSubmit={(p) => mut.mutate({ id: modal.editing?.id, p })} />
        )}
      </Modal>

      {/* Panel de detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle ? `${detalle.codigo} · ${detalle.nombre}` : ""}>
        {detalle && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">{detalle.descripcion || "Sin descripción."}</p>
            <div className="grid grid-cols-2 gap-2">
              {[["Grupo", detalle.grupo], ["Severidad", `${detalle.severidad}`], ["Degradación D", detalle.degradacion?.toFixed(1)],
                ["CIA afectada", detalle.cia || "—"], ["Origen", detalle.precargada ? "Catálogo" : "Personalizada"]].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 p-2.5"><p className="text-[11px] uppercase tracking-wide text-slate-400">{l}</p><p className="font-semibold text-slate-700">{v}</p></div>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Amenazas asociadas</p>
              <div className="flex flex-wrap gap-1.5">
                {(detalle.amenazas_info || []).length ? detalle.amenazas_info.map((a) => (
                  <span key={a.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"><b className="font-mono text-brand-700">{a.codigo}</b> {a.nombre}</span>
                )) : <span className="text-slate-400">—</span>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
