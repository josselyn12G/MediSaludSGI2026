import { useState } from "react";
import { DEGRADACION_POR_SEVERIDAD, ESCALA_DEGRADACION, GRUPOS_VULN, VALOR_HEAT } from "../data/metodologia";

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function VulnerabilidadForm({ initial, organizacionId, amenazas = [], onSubmit, onCancel, submitting }) {
  const [f, setF] = useState(() => ({
    grupo: "VT", codigo: "", nombre: "", descripcion: "", severidad: 3,
    cia: "C,I", amenazas: [], ...initial,
  }));
  const toggleAm = (id) => setF((p) => ({
    ...p, amenazas: p.amenazas.includes(id) ? p.amenazas.filter((x) => x !== id) : [...p.amenazas, id],
  }));
  const setInput = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const sev = Number(f.severidad);
  const d = DEGRADACION_POR_SEVERIDAD[sev];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...f, severidad: sev, organizacion: organizacionId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <select className={inputCls} value={f.grupo} onChange={setInput("grupo")}>
          {Object.entries(GRUPOS_VULN).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
        </select>
        <input className={inputCls} placeholder="Código (ej. VT-09)" value={f.codigo} onChange={setInput("codigo")} required />
        <input className={`${inputCls} col-span-2`} placeholder="Nombre de la vulnerabilidad" value={f.nombre} onChange={setInput("nombre")} required />
        <textarea className={`${inputCls} col-span-2`} rows={2} placeholder="Descripción en Medisalud" value={f.descripcion} onChange={setInput("descripcion")} />
        <input className={`${inputCls} col-span-2`} placeholder="CIA (ej. C,I,D)" value={f.cia} onChange={setInput("cia")} />
      </div>

      {/* Asociación con amenazas (M2M real) */}
      <div>
        <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          Amenazas asociadas <span className="font-normal normal-case text-slate-400">({f.amenazas.length} seleccionadas)</span>
        </h4>
        <div className="grid max-h-44 grid-cols-2 gap-1 overflow-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-3">
          {amenazas.map((a) => (
            <label key={a.id} className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={f.amenazas.includes(a.id)} onChange={() => toggleAm(a.id)} className="h-3.5 w-3.5 accent-brand-600" />
              <b className="font-mono text-brand-700">{a.codigo}</b> <span className="truncate text-slate-500">{a.nombre}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Define qué amenazas explotan esta vulnerabilidad; se usan para sugerirla en el wizard.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-400">Severidad → Degradación D</label>
        <input type="range" min="1" max="5" value={sev} onChange={setInput("severidad")} className="w-full accent-brand-600" />
        <div className="mt-2 grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((v) => {
            const item = ESCALA_DEGRADACION.find((x) => x.severidad === v);
            const active = v === sev;
            const heat = VALOR_HEAT[v];
            return (
              <div key={v} className={`rounded-md p-2 text-center transition-all duration-300 ${active ? `${heat.bg} scale-105 text-white shadow-md` : `${heat.soft} ${heat.text} opacity-70`}`}>
                <p className="text-xs font-black">{item.sev.split(" ")[0]}</p>
                <p className="text-[10px] font-bold">D={item.d}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-center">
        <p className="text-xs text-slate-500">Degradación calculada (fracción del activo comprometida)</p>
        <p className="text-3xl font-black text-brand-900">D = {d.toFixed(1)}</p>
        <p className="mt-1 text-xs text-slate-500">Entra en la fórmula <b>RI = VA × P × D</b> (Fase 3)</p>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60">
          {submitting ? "Guardando…" : "Guardar vulnerabilidad"}
        </button>
      </div>
    </form>
  );
}
