import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAmenaza, deleteAmenaza, fetchActivos, fetchAmenazas, fetchOrganizaciones, updateAmenaza,
} from "../../api/resources";
import { GRUPOS_AMENAZA, VALOR_HEAT } from "../../data/metodologia";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import AmenazaForm from "../../components/AmenazaForm";

const TABS = [["", "Todas"], ["N", "N · Naturales"], ["I", "I · Industriales"],
  ["E", "E · Errores"], ["A", "A · Ataques"]];

function HeatCell({ valor, children }) {
  const h = VALOR_HEAT[valor] || VALOR_HEAT[3];
  return <span className={`inline-grid h-7 min-w-[2rem] place-items-center rounded-md px-1.5 text-xs font-black text-white ${h.bg}`}>{children}</span>;
}

export default function AmenazasCatalogoPage() {
  const qc = useQueryClient();
  const [grupo, setGrupo] = useState("");
  const [soloLopdp, setSoloLopdp] = useState(false);
  const [modal, setModal] = useState(null); // {editing}
  const [detalle, setDetalle] = useState(null);

  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;
  const { data: amenazas } = useQuery({ queryKey: ["amenazas"], queryFn: () => fetchAmenazas() });
  const { data: activos = [] } = useQuery({ queryKey: ["activos"], queryFn: () => fetchActivos() });

  const inv = () => qc.invalidateQueries({ queryKey: ["amenazas"] });
  const mut = useMutation({
    mutationFn: ({ id, p }) => (id ? updateAmenaza(id, p) : createAmenaza(p)),
    onSuccess: () => { inv(); setModal(null); },
  });
  const del = useMutation({ mutationFn: deleteAmenaza, onSuccess: inv });

  const rows = useMemo(() => (amenazas || [])
    .filter((a) => (!grupo || a.grupo === grupo) && (!soloLopdp || a.es_critica)), [amenazas, grupo, soloLopdp]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Catálogo de Amenazas</h1>
          <p className="text-slate-500">MAGERIT §5.2 · 34 amenazas precargadas · F_PERT = (O + 4·MP + P) / 6</p>
        </div>
        <button onClick={() => setModal({ editing: null })} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700">
          <Icon name="spark" className="h-4 w-4" /> Registrar nueva amenaza
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(([g, l]) => (
          <button key={g} onClick={() => setGrupo(g)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${grupo === g ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            {l}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={soloLopdp} onChange={(e) => setSoloLopdp(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Solo críticas LOPDP
        </label>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">ID</th><th className="px-3 py-3">Amenaza</th>
              <th className="px-3 py-3 text-center">TEF_PERT</th><th className="px-3 py-3 text-center">P</th>
              <th className="px-3 py-3">CIA</th><th className="px-3 py-3 text-center">LOPDP</th>
              <th className="px-3 py-3 text-center">Origen</th><th className="px-3 py-3 text-right">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} onClick={() => setDetalle(a)}
                className={`cursor-pointer border-t border-slate-100 hover:bg-brand-50/40 ${a.es_critica ? "bg-red-50/30" : ""}`}>
                <td className="px-3 py-2.5 font-mono font-bold text-brand-700">{a.codigo}</td>
                <td className="px-3 py-2.5"><p className="font-medium text-slate-800">{a.nombre}</p><p className="text-[11px] text-slate-400">{a.tipo}</p></td>
                <td className="px-3 py-2.5 text-center"><HeatCell valor={a.nivel_probabilidad}>{a.f_pert}</HeatCell></td>
                <td className="px-3 py-2.5 text-center font-bold text-slate-700">{a.nivel_probabilidad}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{a.cia || "—"}</td>
                <td className="px-3 py-2.5 text-center">{a.es_critica ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">⚠ 72h</span> : <span className="text-slate-300">—</span>}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.precargada ? "bg-slate-100 text-slate-500" : "bg-brand-100 text-brand-700"}`}>
                    {a.precargada ? "Catálogo" : "Personalizada"}
                  </span>
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setModal({ editing: a })} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Editar"><Icon name="doc" className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm(`¿Eliminar ${a.codigo}?`)) del.mutate(a.id); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar"><Icon name="threats" className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">Sin amenazas para este filtro.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border-l-4 border-neutral-300 bg-neutral-50 p-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">Se usa en:</span> el wizard de escenarios (Paso 2) y la Fase 3 (TEF_PERT por escenario).
      </div>

      {/* Modal crear/editar */}
      <Modal open={!!modal} onClose={() => setModal(null)} wide expandable title={modal?.editing ? "Editar amenaza" : "Nueva amenaza"}>
        {modal && orgId && (
          <AmenazaForm initial={modal.editing} organizacionId={orgId} activos={activos} submitting={mut.isPending}
            onCancel={() => setModal(null)} onSubmit={(p) => mut.mutate({ id: modal.editing?.id, p })} />
        )}
      </Modal>

      {/* Panel de detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle ? `${detalle.codigo} · ${detalle.nombre}` : ""}>
        {detalle && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">{detalle.descripcion || "Sin descripción."}</p>
            <div className="grid grid-cols-2 gap-2">
              {[["Grupo", GRUPOS_AMENAZA[detalle.grupo]], ["Tipo", detalle.tipo],
                ["TEF O / MP / P", `${detalle.f_o} / ${detalle.f_mp} / ${detalle.f_p}`],
                ["TEF_PERT", `${detalle.f_pert} /año`], ["Nivel P", detalle.nivel_probabilidad],
                ["CIA afectada", detalle.cia || "—"], ["Activos del inventario afectados", (detalle.activos_codigos || []).join(", ") || "—"],
                ["Crítica LOPDP", detalle.es_critica ? "Sí (notificación SPDP 72h)" : "No"]].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">{l}</p>
                  <p className="font-semibold text-slate-700">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
