import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteEscenarioRiesgo, fetchControles, patchEscenarioTratamiento } from "../api/resources";
import { formatUSD } from "../data/metodologia";

const NIVEL_CLS = {
  critico: "bg-red-100 text-red-800", alto: "bg-orange-100 text-orange-800",
  medio: "bg-yellow-100 text-yellow-800", bajo: "bg-green-100 text-green-800",
};

function Campo({ l, v }) {
  return <div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[11px] uppercase tracking-wide text-slate-400">{l}</p><p className="font-semibold text-slate-700">{v ?? "—"}</p></div>;
}

export default function EscenarioDetalle({ esc, onClose, startEdit = false }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState(startEdit);
  const [f, setF] = useState({
    estrategia_tratamiento: esc.estrategia_tratamiento || "", costo_control_estimado_usd: esc.costo_control_estimado_usd || "",
    decision_analista: esc.decision_analista || "", aprobado_por: esc.aprobado_por || "",
    controles: esc.controles_propuestos || [],
  });
  const { data: controles = [] } = useQuery({ queryKey: ["controles"], queryFn: () => fetchControles() });
  const inval = () => { qc.invalidateQueries({ queryKey: ["escenarios-riesgo"] }); qc.invalidateQueries({ queryKey: ["escenario-riesgo-stats"] }); };

  const save = useMutation({
    mutationFn: () => patchEscenarioTratamiento(esc.id, {
      estrategia_tratamiento: f.estrategia_tratamiento, controles_propuestos: f.controles,
      costo_control_estimado_usd: f.costo_control_estimado_usd ? Number(f.costo_control_estimado_usd) : null,
      decision_analista: f.decision_analista, aprobado_por: f.aprobado_por,
    }),
    onSuccess: () => { inval(); setEdit(false); onClose?.(); },
  });
  const del = useMutation({ mutationFn: () => deleteEscenarioRiesgo(esc.id), onSuccess: () => { inval(); onClose?.(); } });
  const toggle = (id) => setF((s) => ({ ...s, controles: s.controles.includes(id) ? s.controles.filter((x) => x !== id) : [...s.controles, id] }));

  return (
    <div className="space-y-5 text-sm">
      {/* Componentes y autoría */}
      <div>
        <p className="mb-2 font-bold text-brand-900">Escenario de riesgo</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Campo l="Activo" v={`${esc.activo_codigo} · ${esc.activo_nombre}`} />
          <Campo l="Amenaza" v={`${esc.amenaza_codigo} · ${esc.amenaza_nombre}`} />
          <Campo l="Vulnerabilidad" v={`${esc.vulnerabilidad_codigo} · ${esc.vulnerabilidad_nombre}`} />
          <Campo l="Control existente" v={esc.control_codigo || "ninguno"} />
          <Campo l="Creado por" v={esc.creado_por_email} />
          <Campo l="Fecha" v={esc.creado_en?.slice(0, 16).replace("T", " ")} />
          <Campo l="Estado" v={esc.estado_display} />
          <Campo l="Justificación TEF" v={esc.justificacion_tef} />
        </div>
      </div>

      {/* Resultados */}
      <div>
        <p className="mb-2 font-bold text-brand-900">Resultados del cálculo</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Campo l="VA·P·D" v={`${esc.va} · ${esc.p_nivel} · ${esc.d}`} />
          <Campo l="RI" v={esc.ri} /><Campo l="RR" v={esc.rr} />
          <Campo l="RR_simple" v={esc.rr_simple} />
          <Campo l="FRC" v={esc.frc} />
          <Campo l="TEF_PERT" v={`${esc.tef_pert_efectivo}/año`} />
          <Campo l="ALE_PERT" v={formatUSD(esc.ale_pert_usd)} />
          <div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[11px] uppercase tracking-wide text-slate-400">Nivel</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${NIVEL_CLS[esc.nivel]}`}>{esc.nivel}</span></div>
          <Campo l="ALE P90 / P95" v={`${formatUSD(esc.ale_p90_usd)} / ${formatUSD(esc.ale_p95_usd)}`} />
        </div>
      </div>

      {/* Tratamiento */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-bold text-brand-900">Tratamiento</p>
          {!edit && <button onClick={() => setEdit(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Editar</button>}
        </div>
        {!edit ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Campo l="Estrategia" v={esc.estrategia_tratamiento || "—"} />
            <Campo l="Costo USD/año" v={esc.costo_control_estimado_usd ? formatUSD(esc.costo_control_estimado_usd) : "—"} />
            <Campo l="Aprobado por" v={esc.aprobado_por} />
            <Campo l="Controles" v={(esc.controles_info || []).map((c) => c.codigo).join(", ") || "—"} />
            <div className="col-span-2 sm:col-span-4"><Campo l="Decisión del analista" v={esc.decision_analista} /></div>
          </div>
        ) : (
          <div className="space-y-3">
            <select value={f.estrategia_tratamiento} onChange={(e) => setF((s) => ({ ...s, estrategia_tratamiento: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Estrategia…</option>{["mitigar", "transferir", "aceptar", "evitar"].map((x) => <option key={x} value={x} className="capitalize">{x}</option>)}
            </select>
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="number" value={f.costo_control_estimado_usd} onChange={(e) => setF((s) => ({ ...s, costo_control_estimado_usd: e.target.value }))} placeholder="Costo USD/año" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={f.aprobado_por} onChange={(e) => setF((s) => ({ ...s, aprobado_por: e.target.value }))} placeholder="Aprobado por" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <textarea rows={2} value={f.decision_analista} onChange={(e) => setF((s) => ({ ...s, decision_analista: e.target.value }))} placeholder="Decisión y justificación" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid max-h-40 grid-cols-2 gap-1 overflow-auto rounded-lg border border-slate-200 p-2">
              {controles.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.controles.includes(c.id)} onChange={() => toggle(c.id)} className="h-3.5 w-3.5 accent-brand-600" /><b className="font-mono text-brand-700">{c.codigo}</b> {c.nombre}</label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">{save.isPending ? "Guardando…" : "Guardar tratamiento"}</button>
              <button onClick={() => setEdit(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Eliminar */}
      <div className="flex justify-end border-t border-slate-100 pt-3">
        <button onClick={() => { if (confirm(`¿Eliminar el escenario ${esc.codigo || esc.id} y su tratamiento?`)) del.mutate(); }}
          disabled={del.isPending} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
          {del.isPending ? "Eliminando…" : "Eliminar escenario"}
        </button>
      </div>
    </div>
  );
}
