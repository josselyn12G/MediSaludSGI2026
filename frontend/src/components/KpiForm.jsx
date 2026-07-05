import { useState } from "react";

const FRECUENCIAS = ["Semanal", "Mensual", "Trimestral", "Anual", "Por evento"];

export default function KpiForm({ initial, organizacionId, onSubmit, onCancel, submitting }) {
  const [f, setF] = useState(() => ({
    codigo: initial?.codigo || "",
    nombre: initial?.nombre || "",
    formula: initial?.formula || "",
    linea_base: initial?.linea_base || "",
    meta: initial?.meta || "",
    umbral_alerta: initial?.umbral_alerta || "",
    frecuencia: initial?.frecuencia || "Mensual",
    responsable: initial?.responsable || "",
  }));

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...f, organizacion: initial?.organizacion || organizacionId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Código</label>
          <input value={f.codigo} onChange={set("codigo")} required
            placeholder="KPI-11"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Frecuencia</label>
          <select value={f.frecuencia} onChange={set("frecuencia")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {FRECUENCIAS.map((fr) => <option key={fr} value={fr}>{fr}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Nombre del KPI</label>
        <input value={f.nombre} onChange={set("nombre")} required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Fórmula / Fuente</label>
        <input value={f.formula} onChange={set("formula")}
          placeholder="Ej. Σ ALE_PERT escenarios activos"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Línea base</label>
          <input value={f.linea_base} onChange={set("linea_base")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Meta (12 meses)</label>
          <input value={f.meta} onChange={set("meta")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Umbral de alerta</label>
        <textarea value={f.umbral_alerta} onChange={set("umbral_alerta")} rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Responsable</label>
        <input value={f.responsable} onChange={set("responsable")}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">
          Cancelar
        </button>
        <button type="submit" disabled={submitting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {submitting ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}