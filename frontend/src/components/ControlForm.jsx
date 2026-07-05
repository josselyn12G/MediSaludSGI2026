import { useState } from "react";
import { ESCALA_FRC, FRC_POR_ESTADO } from "../data/metodologia";

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

const FRC_COLOR = { ausente: "bg-red-500", parcial: "bg-yellow-500", implementado: "bg-green-500" };

export default function ControlForm({ initial, organizacionId, vulnerabilidades = [], onSubmit, onCancel, submitting }) {
  const [f, setF] = useState(() => ({
    codigo: "", nombre: "", iso_ref: "", estado: "parcial",
    vulnerabilidades: [], activos_protegidos: "", ...initial,
  }));
  const toggleVuln = (id) => setF((p) => ({
    ...p, vulnerabilidades: p.vulnerabilidades.includes(id) ? p.vulnerabilidades.filter((x) => x !== id) : [...p.vulnerabilidades, id],
  }));
  const setInput = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const frc = FRC_POR_ESTADO[f.estado];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...f, organizacion: organizacionId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} placeholder="Código (ej. CTR-11)" value={f.codigo} onChange={setInput("codigo")} required />
        <input className={inputCls} placeholder="Ref. ISO 27002 (ej. 8.5)" value={f.iso_ref} onChange={setInput("iso_ref")} />
        <input className={`${inputCls} col-span-2`} placeholder="Nombre del control" value={f.nombre} onChange={setInput("nombre")} required />
      </div>

      {/* Asociación con vulnerabilidades mitigadas (M2M real) */}
      <div>
        <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          Vulnerabilidades mitigadas <span className="font-normal normal-case text-slate-400">({f.vulnerabilidades.length} seleccionadas)</span>
        </h4>
        <div className="grid max-h-44 grid-cols-2 gap-1 overflow-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-3">
          {vulnerabilidades.map((v) => (
            <label key={v.id} className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={f.vulnerabilidades.includes(v.id)} onChange={() => toggleVuln(v.id)} className="h-3.5 w-3.5 accent-brand-600" />
              <b className="font-mono text-brand-700">{v.codigo}</b> <span className="truncate text-slate-500">{v.nombre}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">El estado define el FRC; las vulnerabilidades indican qué mitiga (RR = RI × FRC).</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-400">Estado de implementación → FRC</label>
        <div className="grid grid-cols-3 gap-2">
          {ESCALA_FRC.map((e) => {
            const active = e.estado === f.estado;
            return (
              <button
                type="button"
                key={e.estado}
                onClick={() => setF((p) => ({ ...p, estado: e.estado }))}
                className={`rounded-lg border-2 p-3 text-center transition ${active ? "border-brand-500 bg-brand-50 shadow-sm" : "border-slate-200 bg-white opacity-70 hover:opacity-100"}`}
              >
                <span className={`mx-auto mb-1 block h-2 w-2 rounded-full ${FRC_COLOR[e.estado]}`} />
                <p className="text-sm font-bold text-slate-700">{e.label}</p>
                <p className="text-lg font-black text-brand-900">FRC {e.frc}</p>
                <p className="text-[10px] text-slate-400">{e.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-center">
        <p className="text-xs text-slate-500">Factor de Reducción del Control</p>
        <p className="text-3xl font-black text-brand-900">FRC = {frc.toFixed(1)}</p>
        <p className="mt-1 text-xs text-slate-500">Transforma el riesgo: <b>RR = RI × FRC = VA × P × D × FRC</b></p>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60">
          {submitting ? "Guardando…" : "Guardar control"}
        </button>
      </div>
    </form>
  );
}
