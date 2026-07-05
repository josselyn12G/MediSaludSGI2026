import { useMemo, useState } from "react";
import {
  CLASIFICACION_NC,
  DESCRIPTOR_NIVEL,
  DIMENSIONES,
  NIVELES_VAD,
  NIVELES_VAG,
  VALOR_HEAT,
  calcularVA,
} from "../data/metodologia";
import Badge from "./Badge";
import HeatScale from "./HeatScale";
import HeatMap5x5 from "./HeatMap5x5";

const BASE_DIMS = ["dim_confidencialidad", "dim_integridad", "dim_disponibilidad",
                   "dim_legal", "dim_operativo", "dim_economico"];
const AD_DIMS = ["dim_exposicion", "dim_sensibilidad"];

function Slider({ dim, value, onChange, disabled }) {
  const meta = DIMENSIONES.find((d) => d.key === dim.key);
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          [{meta.cod}] {meta.nombre}
        </label>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {DESCRIPTOR_NIVEL[value]}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-600 disabled:opacity-50"
      />
      <HeatScale dimKey={dim.key} value={value} />
    </div>
  );
}

export default function ActivoForm({ initial, tipos, procesos, organizacionId, onSubmit, onCancel, submitting }) {
  const [f, setF] = useState(() => ({
    codigo: "",
    nombre: "",
    tipo: tipos?.[0]?.id || "",
    propietario: "",
    custodio_tecnico: "",
    ubicacion: "",
    proceso_asociado: "",
    estado: "activo",
    procesa_datos_salud: false,
    clasificacion: "",
    dim_confidencialidad: 1,
    dim_integridad: 1,
    dim_disponibilidad: 1,
    dim_legal: 1,
    dim_operativo: 1,
    dim_economico: 1,
    dim_exposicion: 1,
    dim_sensibilidad: 1,
    notas: "",
    ...initial,
  }));

  const tipoObj = tipos?.find((t) => String(t.id) === String(f.tipo));
  const esAD = tipoObj?.formula === "VAD";

  const dims = useMemo(() => ({
    dim_confidencialidad: f.procesa_datos_salud ? 5 : f.dim_confidencialidad,
    dim_integridad: f.dim_integridad,
    dim_disponibilidad: f.dim_disponibilidad,
    dim_legal: f.dim_legal,
    dim_operativo: f.dim_operativo,
    dim_economico: f.dim_economico,
    dim_exposicion: f.dim_exposicion,
    dim_sensibilidad: esAD && f.procesa_datos_salud ? 5 : f.dim_sensibilidad,
  }), [f, esAD]);

  const result = calcularVA(dims, esAD ? "VAD" : "VAG");
  const clasifEff = f.clasificacion || result.nc;

  const terminos = useMemo(() => {
    const t = [
      { cod: "C", nombre: "Confidencialidad", val: dims.dim_confidencialidad },
      { cod: "I", nombre: "Integridad", val: dims.dim_integridad },
      { cod: "D", nombre: "Disponibilidad", val: dims.dim_disponibilidad },
      { cod: "Legal", nombre: "Legal", val: dims.dim_legal },
      { cod: "Ope", nombre: "Operativo", val: dims.dim_operativo },
      { cod: "Eco", nombre: "Económico", val: dims.dim_economico },
    ];
    if (esAD) {
      t.push({ cod: "Exp", nombre: "Exposición", val: dims.dim_exposicion });
      t.push({ cod: "Sen", nombre: "Sensibilidad", val: dims.dim_sensibilidad });
    }
    return t;
  }, [dims, esAD]);

  const impacto = Math.max(
    dims.dim_confidencialidad,
    dims.dim_integridad,
    dims.dim_disponibilidad
  );

  const set = (k) => (v) => setF((prev) => ({ ...prev, [k]: v }));
  const setInput = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...f,
      organizacion: organizacionId,
      tipo: f.tipo,
      proceso_asociado: f.proceso_asociado || null,
      dim_confidencialidad: dims.dim_confidencialidad,
      dim_exposicion: esAD ? dims.dim_exposicion : null,
      dim_sensibilidad: esAD ? dims.dim_sensibilidad : null,
      clasificacion: f.clasificacion || result.nc,
    };
    onSubmit(payload);
  };

  const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección 1 */}
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">1 · Datos generales</h4>
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Código (ej. INF005)" value={f.codigo} onChange={setInput("codigo")} required />
          <input className={inputCls} placeholder="Nombre del activo" value={f.nombre} onChange={setInput("nombre")} required />
          <select className={inputCls} value={f.tipo} onChange={setInput("tipo")} required>
            {tipos?.map((t) => <option key={t.id} value={t.id}>{t.codigo} · {t.nombre}</option>)}
          </select>
          <select className={inputCls} value={f.proceso_asociado || ""} onChange={setInput("proceso_asociado")}>
            <option value="">— Proceso asociado —</option>
            {procesos?.map((p) => <option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>)}
          </select>
          <input className={inputCls} placeholder="Propietario" value={f.propietario} onChange={setInput("propietario")} />
          <input className={inputCls} placeholder="Custodio técnico" value={f.custodio_tecnico} onChange={setInput("custodio_tecnico")} />
          <input className={inputCls} placeholder="Ubicación" value={f.ubicacion} onChange={setInput("ubicacion")} />
          <select className={inputCls} value={f.estado} onChange={setInput("estado")}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="en_revision">En revisión</option>
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={f.procesa_datos_salud}
            onChange={(e) => setF((p) => ({ ...p, procesa_datos_salud: e.target.checked }))}
            className="h-4 w-4 accent-brand-600"
          />
          Procesa datos de salud (LOPDP → C=5 automático{esAD ? " · Sen=5" : ""})
        </label>
      </div>

      {/* Sección 2 */}
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
          2 · Valoración de dimensiones {esAD ? "(VAD · 8 dimensiones)" : "(VAG · 6 dimensiones)"}
        </h4>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {BASE_DIMS.map((key) => (
            <Slider
              key={key}
              dim={{ key }}
              value={dims[key]}
              disabled={key === "dim_confidencialidad" && f.procesa_datos_salud}
              onChange={set(key)}
            />
          ))}
          {esAD && AD_DIMS.map((key) => (
            <Slider
              key={key}
              dim={{ key }}
              value={dims[key]}
              disabled={key === "dim_sensibilidad" && f.procesa_datos_salud}
              onChange={set(key)}
            />
          ))}
        </div>
      </div>

      {/* Sección 3: resultado en tiempo real */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-700">
          3 · Cálculo en tiempo real
        </h4>

        {/* Fórmula viva: suma de dimensiones */}
        <div className="mb-4 rounded-lg bg-white p-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            {esAD ? "VAD = C+I+D+Legal+Ope+Eco+Exp+Sen" : "VAG = C+I+D+Legal+Ope+Eco"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {terminos.map((t, idx) => (
              <span key={t.cod} className="flex items-center gap-1.5">
                <span
                  className={`inline-grid h-8 w-8 place-items-center rounded-md font-black text-white transition-all duration-300 ${VALOR_HEAT[t.val].bg}`}
                  title={t.nombre}
                >
                  {t.val}
                </span>
                {idx < terminos.length - 1 && <span className="text-slate-400">+</span>}
              </span>
            ))}
            <span className="ml-1 text-slate-400">=</span>
            <span className="ml-1 inline-grid h-9 min-w-[2.5rem] place-items-center rounded-md bg-brand-900 px-2 text-lg font-black text-white">
              {result.score}
            </span>
          </div>
        </div>

        {/* Escalera de normalización (mini mapa de calor) */}
        <div className="mb-4 rounded-lg bg-white p-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            Normalización a VA (1–5) → el score cae en:
          </p>
          <div className="space-y-1">
            {(esAD ? NIVELES_VAD : NIVELES_VAG).map((r) => {
              const activo = r.nivel === result.nivel;
              return (
                <div
                  key={r.rango}
                  className={`flex items-center justify-between rounded-md px-3 py-1.5 text-xs transition-all duration-300 ${
                    activo
                      ? "border-2 border-brand-500 bg-brand-50 font-bold shadow-sm"
                      : "bg-slate-50 opacity-60"
                  }`}
                >
                  <span className="font-mono text-slate-600">{r.rango}</span>
                  <span className="flex items-center gap-2">
                    <Badge nivel={r.nivel} />
                    <span className="text-slate-500">VA={r.va} · {r.nc}</span>
                    {activo && <span className="text-brand-600">◄ aquí</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resultado + ubicación en mapa de calor 5×5 */}
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="text-xs text-slate-400">VA (1–5)</p>
              <p className="text-3xl font-black text-brand-900">{result.va}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-white p-3">
              <p className="mb-1 text-xs text-slate-400">Nivel</p>
              <Badge nivel={result.nivel} />
            </div>
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="mb-1 text-xs text-slate-400">Clasificación (§5.1.3)</p>
              <select value={clasifEff} onChange={setInput("clasificacion")}
                className="w-full rounded-md border border-slate-300 px-1 py-1 text-center text-sm font-bold text-brand-900">
                {Object.entries(CLASIFICACION_NC).map(([nc, c]) => (
                  <option key={nc} value={nc}>{nc} · {c.nombre}</option>
                ))}
              </select>
              {f.clasificacion && f.clasificacion !== result.nc && (
                <p className="mt-1 text-[10px] text-orange-500">Asignada manualmente (derivada: {result.nc})</p>
              )}
            </div>
            {CLASIFICACION_NC[clasifEff] && (
              <div className="col-span-3 rounded-lg bg-white p-3">
                <p className="text-xs text-slate-400">
                  <span className={`mr-2 rounded-full border px-2 py-0.5 text-[11px] font-bold ${CLASIFICACION_NC[clasifEff].color}`}>{CLASIFICACION_NC[clasifEff].nombre}</span>
                  Criterio §5.1.3
                </p>
                <p className="mt-1 text-[11px] text-slate-600">{CLASIFICACION_NC[clasifEff].criterio}</p>
              </div>
            )}
            <div className="col-span-3 rounded-lg bg-white p-3">
              <p className="text-xs text-slate-400">Impacto I = máx(C, I, D) = <b className="text-brand-700">{impacto}</b></p>
              <p className="mt-1 text-[11px] text-slate-500">
                Posición estimada en mapa de calor: P (frecuencia de amenaza) × I = {impacto}.
                El nivel definitivo se calcula en la Fase 3 (FAIR + Monte Carlo).
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="mb-2 text-center text-xs font-semibold text-slate-500">Mapa de calor 5×5 (columna I = {impacto})</p>
            <HeatMap5x5 highlight={{ p: result.va, i: impacto }} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60">
          {submitting ? "Guardando…" : "Guardar activo"}
        </button>
      </div>
    </form>
  );
}
