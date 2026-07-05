import { useState } from "react";
import {
  ESCALA_TEF,
  GRUPOS_AMENAZA,
  VALOR_HEAT,
  fPert,
  nivelProbabilidad,
} from "../data/metodologia";

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function AmenazaForm({ initial, organizacionId, activos = [], onSubmit, onCancel, submitting }) {
  const [f, setF] = useState(() => ({
    grupo: "A", codigo: "", nombre: "", descripcion: "", tipo: "Intenc./Ext.",
    f_o: 0.1, f_mp: 1, f_p: 4, cia: "C,I", activos_afectados: "", es_critica: false,
    activos: [],
    ...initial,
  }));
  const toggleActivo = (id) => setF((p) => ({
    ...p, activos: p.activos.includes(id) ? p.activos.filter((x) => x !== id) : [...p.activos, id],
  }));

  const setInput = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const fp = fPert(f.f_o, f.f_mp, f.f_p);
  const nivelP = nivelProbabilidad(fp);
  const tef = ESCALA_TEF.find((t) => t.valor === nivelP);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...f,
      organizacion: organizacionId,
      f_o: Number(f.f_o), f_mp: Number(f.f_mp), f_p: Number(f.f_p),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <select className={inputCls} value={f.grupo} onChange={setInput("grupo")}>
          {Object.entries(GRUPOS_AMENAZA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className={inputCls} placeholder="Código (ej. A.16)" value={f.codigo} onChange={setInput("codigo")} required />
        <input className={`${inputCls} col-span-2`} placeholder="Nombre de la amenaza" value={f.nombre} onChange={setInput("nombre")} required />
        <textarea className={`${inputCls} col-span-2`} rows={2} placeholder="Descripción en Medisalud" value={f.descripcion} onChange={setInput("descripcion")} />
        <input className={inputCls} placeholder="Tipo (ej. Intenc./Ext.)" value={f.tipo} onChange={setInput("tipo")} />
        <input className={inputCls} placeholder="CIA afectada (ej. C,I,D)" value={f.cia} onChange={setInput("cia")} />
      </div>

      {/* Asociación con activos reales del inventario */}
      <div>
        <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          Activos del inventario afectados <span className="font-normal normal-case text-slate-400">({f.activos.length} seleccionados)</span>
        </h4>
        <div className="grid max-h-44 grid-cols-2 gap-1 overflow-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-3">
          {activos.map((a) => (
            <label key={a.id} className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={f.activos.includes(a.id)} onChange={() => toggleActivo(a.id)} className="h-3.5 w-3.5 accent-brand-600" />
              <b className="font-mono text-brand-700">{a.codigo}</b> <span className="truncate text-slate-500">{a.nombre}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Estos activos se usan para preseleccionar las amenazas en el wizard de escenarios.</p>
      </div>

      {/* Estimación PERT de frecuencia */}
      <div>
        <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">Estimación PERT de frecuencia (eventos/año)</h4>
        <div className="grid grid-cols-3 gap-3">
          {[["f_o", "Optimista (O)"], ["f_mp", "Más probable (MP)"], ["f_p", "Pesimista (P)"]].map(([k, l]) => (
            <div key={k}>
              <label className="mb-1 block text-xs text-slate-500">{l}</label>
              <input type="number" step="0.001" min="0" className={inputCls} value={f[k]} onChange={setInput(k)} required />
            </div>
          ))}
        </div>
      </div>

      {/* Cálculo en tiempo real */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-700">Cálculo en tiempo real</h4>
        <div className="mb-3 rounded-lg bg-white p-3 text-center text-sm">
          <span className="text-slate-500">F_PERT = (O + 4·MP + P) / 6 = </span>
          <span className="font-mono">({f.f_o} + 4·{f.f_mp} + {f.f_p}) / 6 = </span>
          <span className="text-lg font-black text-brand-900">{fp}</span>
          <span className="text-slate-400"> /año</span>
        </div>
        <p className="mb-1 text-xs font-semibold text-slate-500">Nivel de Probabilidad P resultante:</p>
        <div className="grid grid-cols-5 gap-1">
          {[5, 4, 3, 2, 1].map((v) => {
            const t = ESCALA_TEF.find((x) => x.valor === v);
            const active = v === nivelP;
            const heat = VALOR_HEAT[v];
            return (
              <div key={v} className={`rounded-md p-2 text-center transition-all duration-300 ${active ? `${heat.bg} scale-105 text-white shadow-md` : `${heat.soft} ${heat.text} opacity-70`}`}>
                <p className="text-sm font-black">P={v}</p>
                <p className="text-[9px] font-semibold">{t.nivel}</p>
                <p className="text-[8px] leading-tight">{t.rango}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          → Nivel <b className="text-brand-700">{tef?.nivel}</b> (P={nivelP}) · {tef?.desc}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={f.es_critica} onChange={(e) => setF((p) => ({ ...p, es_critica: e.target.checked }))} className="h-4 w-4 accent-brand-600" />
        Amenaza CRÍTICA (puede activar notificación SPDP 72h / EIPD — LOPDP Art. 38/42)
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60">
          {submitting ? "Guardando…" : "Guardar amenaza"}
        </button>
      </div>
    </form>
  );
}
