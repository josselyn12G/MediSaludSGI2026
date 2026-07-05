import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createControl, deleteControl, fetchControles, fetchOrganizaciones,
  fetchVulnerabilidades, patchControlEstado, updateControl,
} from "../../api/resources";
import { ESCALA_FRC } from "../../data/metodologia";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import ControlForm from "../../components/ControlForm";

const ESTADO_BADGE = {
  ausente: "bg-red-100 text-red-700 border-red-300",
  parcial: "bg-yellow-100 text-yellow-700 border-yellow-300",
  implementado: "bg-green-100 text-green-700 border-green-300",
};
const ESTADOS = ["ausente", "parcial", "implementado"];

export default function ControlesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [detalle, setDetalle] = useState(null);

  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;
  const { data: controles } = useQuery({ queryKey: ["controles"], queryFn: () => fetchControles() });
  const { data: vulnerabilidades = [] } = useQuery({ queryKey: ["vulnerabilidades"], queryFn: () => fetchVulnerabilidades() });

  const inv = () => qc.invalidateQueries({ queryKey: ["controles"] });
  const mut = useMutation({
    mutationFn: ({ id, p }) => (id ? updateControl(id, p) : createControl(p)),
    onSuccess: () => { inv(); setModal(null); },
  });
  const del = useMutation({ mutationFn: deleteControl, onSuccess: inv });
  const estadoMut = useMutation({
    mutationFn: ({ id, estado }) => patchControlEstado(id, estado),
    onSuccess: inv,
  });

  const cambiarEstado = (c, estado) => {
    if (estado === c.estado) return;
    if (confirm(`Cambiar ${c.codigo} a "${estado}" recalculará el FRC y afecta el RR de los escenarios que lo referencian. ¿Continuar?`)) {
      estadoMut.mutate({ id: c.id, estado });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Catálogo de Controles</h1>
          <p className="text-slate-500">MAGERIT §5.4 · ISO 27002:2022 · Estado → FRC (1.0 / 0.6 / 0.3)</p>
        </div>
        <button onClick={() => setModal({ editing: null })} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700">
          <Icon name="spark" className="h-4 w-4" /> Registrar nuevo control
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">ID</th><th className="px-3 py-3">Control</th>
              <th className="px-3 py-3">Ref. ISO</th><th className="px-3 py-3">Estado (editable)</th>
              <th className="px-3 py-3 text-center">FRC</th><th className="px-3 py-3">Vuln. mitigadas</th>
              <th className="px-3 py-3 text-right">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {(controles || []).map((c) => (
              <tr key={c.id} className={`border-t border-slate-100 ${c.estado === "ausente" ? "bg-red-50/30" : ""}`}>
                <td className="px-3 py-2.5 font-mono font-bold text-brand-700">{c.codigo}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{c.nombre}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{c.iso_ref}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    {ESTADOS.map((e) => (
                      <button key={e} onClick={() => cambiarEstado(c, e)} disabled={estadoMut.isPending}
                        className={`rounded-md border px-2 py-1 text-[10px] font-bold capitalize transition ${c.estado === e ? ESTADO_BADGE[e] : "border-slate-200 text-slate-400 hover:bg-slate-50"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center font-black text-slate-700">{c.frc?.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-[11px] text-slate-400">{(c.vulnerabilidades_codigos || []).join(", ") || "—"}</td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setDetalle(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Ver"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span></button>
                    <button onClick={() => setModal({ editing: c })} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Editar"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span></button>
                    <button onClick={() => { if (confirm(`¿Eliminar ${c.codigo}?`)) del.mutate(c.id); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda FRC */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ESCALA_FRC.map((f) => (
          <div key={f.estado} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-bold capitalize text-slate-700">{f.label}</p>
            <p className="text-2xl font-black text-brand-700">FRC {f.frc.toFixed(1)}</p>
            <p className="text-xs text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} wide expandable title={modal?.editing ? "Editar control" : "Nuevo control"}>
        {modal && orgId && (
          <ControlForm initial={modal.editing} organizacionId={orgId} vulnerabilidades={vulnerabilidades} submitting={mut.isPending}
            onCancel={() => setModal(null)} onSubmit={(p) => mut.mutate({ id: modal.editing?.id, p })} />
        )}
      </Modal>

      {/* Panel de detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle ? `${detalle.codigo} · ${detalle.nombre}` : ""}>
        {detalle && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {[["Ref. ISO 27002", detalle.iso_ref || "—"], ["Estado", detalle.estado_display], ["FRC", detalle.frc?.toFixed(1)],
                ["Origen", detalle.precargado ? "Catálogo" : "Personalizado"]].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 p-2.5"><p className="text-[11px] uppercase tracking-wide text-slate-400">{l}</p><p className="font-semibold text-slate-700">{v}</p></div>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Vulnerabilidades mitigadas</p>
              <div className="flex flex-wrap gap-1.5">
                {(detalle.vulnerabilidades_info || []).length ? detalle.vulnerabilidades_info.map((v) => (
                  <span key={v.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"><b className="font-mono text-brand-700">{v.codigo}</b> {v.nombre}</span>
                )) : <span className="text-slate-400">—</span>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
