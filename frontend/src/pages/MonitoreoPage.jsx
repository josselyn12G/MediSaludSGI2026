import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  createTareaMonitoreo, deleteTareaMonitoreo, fetchCiclosMonitoreo,
  fetchEscenariosRiesgo, fetchOrganizaciones, fetchTareasMonitoreo, updateTareaMonitoreo,
} from "../api/resources";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import { formatUSD } from "../data/metodologia";

// §9.1: la frecuencia de monitoreo la determina el nivel de riesgo residual
const FRECUENCIA_POR_NIVEL = { critico: "Semanal", alto: "Mensual", medio: "Trimestral", bajo: "Anual" };

const FREQ_STYLE = {
  Semanal: { badge: "bg-red-100 text-red-800 border-red-300", card: "border-red-200 bg-red-50/60", text: "text-red-700" },
  Mensual: { badge: "bg-orange-100 text-orange-800 border-orange-300", card: "border-orange-200 bg-orange-50/60", text: "text-orange-700" },
  Trimestral: { badge: "bg-yellow-100 text-yellow-800 border-yellow-300", card: "border-yellow-200 bg-yellow-50/60", text: "text-yellow-700" },
  Anual: { badge: "bg-green-100 text-green-800 border-green-300", card: "border-green-200 bg-green-50/60", text: "text-green-700" },
};

const NIVEL_CLS = {
  critico: "bg-red-100 text-red-800 border-red-300",
  alto: "bg-orange-100 text-orange-800 border-orange-300",
  medio: "bg-yellow-100 text-yellow-800 border-yellow-300",
  bajo: "bg-green-100 text-green-800 border-green-300",
};

const Nivel = ({ n }) => (
  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold capitalize ${NIVEL_CLS[n] || "bg-slate-100 text-slate-600"}`}>{n || "—"}</span>
);

const fmtFecha = (iso) => (iso ? new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");

export default function MonitoreoPage() {
  const qc = useQueryClient();
  const [plan, setPlan] = useState(null); // escenario cuyo plan se está gestionando
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState(null); // {id, texto}
  const [dirFecha, setDirFecha] = useState("desc");

  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;
  const { data: ciclos = [] } = useQuery({ queryKey: ["ciclos-monitoreo"], queryFn: fetchCiclosMonitoreo });
  const { data: escenarios = [], isLoading } = useQuery({ queryKey: ["escenarios-riesgo"], queryFn: () => fetchEscenariosRiesgo() });
  const { data: tareas = [] } = useQuery({ queryKey: ["tareas-monitoreo"], queryFn: () => fetchTareasMonitoreo() });

  const inv = () => qc.invalidateQueries({ queryKey: ["tareas-monitoreo"] });
  const crearMut = useMutation({ mutationFn: createTareaMonitoreo, onSuccess: inv });
  const updMut = useMutation({ mutationFn: ({ id, p }) => updateTareaMonitoreo(id, p), onSuccess: inv });
  const delMut = useMutation({ mutationFn: deleteTareaMonitoreo, onSuccess: inv });
  const generarMut = useMutation({
    mutationFn: async (descripciones) => {
      for (let k = 0; k < descripciones.length; k++) {
        await createTareaMonitoreo({ organizacion: orgId, escenario: plan.id, descripcion: descripciones[k], orden: k });
      }
    },
    onSuccess: inv,
  });

  const frecuenciaDe = (esc) => FRECUENCIA_POR_NIVEL[esc.nivel] || "Anual";
  const cicloDe = (esc) => ciclos.find((c) => c.frecuencia === frecuenciaDe(esc));
  const conPlan = (esc) => !!esc.estrategia_tratamiento;

  const tareasPorEsc = useMemo(() => {
    const m = {};
    tareas.forEach((t) => { (m[t.escenario] = m[t.escenario] || []).push(t); });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.orden - b.orden || a.id - b.id));
    return m;
  }, [tareas]);

  const resumen = ["Semanal", "Mensual", "Trimestral", "Anual"].map((f) => ({
    frecuencia: f,
    ciclo: ciclos.find((c) => c.frecuencia === f),
    activos: escenarios.filter((e) => frecuenciaDe(e) === f && conPlan(e)).length,
    pendientes: escenarios.filter((e) => frecuenciaDe(e) === f && !conPlan(e)).length,
  }));

  const totalSinPlan = escenarios.filter((e) => !conPlan(e)).length;
  const escenariosOrdenados = [...escenarios].sort(
    (a, b) => (new Date(a.creado_en) - new Date(b.creado_en)) * (dirFecha === "asc" ? 1 : -1)
  );

  // Plan sugerido: verificación de los controles del escenario + actividades del ciclo §9.1
  const sugerirTareas = (esc) => {
    const deControles = (esc.controles_info || []).map(
      (c) => `Verificar implementación y eficacia del control ${c.codigo} · ${c.nombre}`
    );
    const ciclo = cicloDe(esc);
    const deCiclo = (ciclo?.actividades || "")
      .split(/\.\s+/).map((s) => s.trim().replace(/\.$/, "")).filter(Boolean);
    return [...deControles, ...deCiclo];
  };

  const tareasPlan = plan ? tareasPorEsc[plan.id] || [] : [];
  const hechas = tareasPlan.filter((t) => t.completada).length;

  const agregarTarea = () => {
    const txt = nueva.trim();
    if (!txt || !plan) return;
    crearMut.mutate({ organizacion: orgId, escenario: plan.id, descripcion: txt, orden: tareasPlan.length });
    setNueva("");
  };

  const guardarEdicion = () => {
    if (!editando) return;
    const txt = editando.texto.trim();
    if (txt) updMut.mutate({ id: editando.id, p: { descripcion: txt } });
    setEditando(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Monitoreo Continuo</h1>
        <p className="text-slate-500">Ciclo PDCA · ISO/IEC 27005:2022 §9.1 · La frecuencia se asigna según el nivel de riesgo; el analista define y da seguimiento al plan de cada escenario</p>
      </div>

      {/* Tarjetas resumen por frecuencia */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((r) => {
          const st = FREQ_STYLE[r.frecuencia];
          return (
            <div key={r.frecuencia} className={`rounded-2xl border p-4 ${st.card}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-black uppercase tracking-wide ${st.text}`}>{r.frecuencia}</p>
                <Icon name="monitor" className={`h-5 w-5 ${st.text}`} />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{r.ciclo?.nivel_riesgo_aplicable || "—"}</p>
              <p className="mt-2 text-3xl font-black text-slate-800">{r.activos}</p>
              <p className="text-[11px] text-slate-500">
                escenario{r.activos === 1 ? "" : "s"} en monitoreo
                {r.pendientes > 0 && <span className="ml-1 font-semibold text-orange-600">· {r.pendientes} sin plan</span>}
              </p>
            </div>
          );
        })}
      </div>

      {/* Escenarios bajo monitoreo */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <p className="font-bold text-brand-900">Escenarios de riesgo y su plan de monitoreo</p>
          {totalSinPlan > 0 && (
            <p className="text-xs font-semibold text-orange-600">
              ⚠ {totalSinPlan} escenario{totalSinPlan === 1 ? "" : "s"} sin tratamiento — <Link to="/riesgos" className="underline">completa su tratamiento</Link> para activar el plan
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-3">Código</th>
                <th className="px-3 py-3">Escenario</th>
                <th className="px-3 py-3">Nivel</th>
                <th className="px-3 py-3 text-center">RR</th>
                <th className="px-3 py-3 text-right">ALE_PERT</th>
                <th className="px-3 py-3">Estrategia</th>
                <th className="px-3 py-3">Frecuencia</th>
                <th className="px-3 py-3">Responsable</th>
                <th className="px-3 py-3"><button onClick={() => setDirFecha((d) => (d === "asc" ? "desc" : "asc"))} className="flex items-center gap-1 uppercase hover:text-brand-600" title="Ordenar por fecha de creación">Creado {dirFecha === "asc" ? "↑" : "↓"}</button></th>
                <th className="px-3 py-3">Plan de monitoreo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="10" className="px-4 py-8 text-center text-slate-400">Cargando…</td></tr>
              ) : escenarios.length === 0 ? (
                <tr><td colSpan="10" className="px-4 py-8 text-center text-slate-400">
                  No hay escenarios de riesgo aún. <Link to="/escenarios/nuevo" className="text-brand-600 underline">Crea el primero</Link>.
                </td></tr>
              ) : escenariosOrdenados.map((e) => {
                const freq = frecuenciaDe(e);
                const ciclo = cicloDe(e);
                const tiene = conPlan(e);
                const st = FREQ_STYLE[freq];
                const ts = tareasPorEsc[e.id] || [];
                const done = ts.filter((t) => t.completada).length;
                return (
                  <tr key={e.id} className={`border-t border-slate-100 ${!tiene ? "bg-orange-50/40" : ""}`}>
                    <td className="px-3 py-2.5 font-mono font-bold text-brand-700">{e.codigo}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-800">{e.nombre}</p>
                      <p className="text-[11px] text-slate-400">{e.activo_codigo} · {e.amenaza_codigo} × {e.vulnerabilidad_codigo}</p>
                    </td>
                    <td className="px-3 py-2.5"><Nivel n={e.nivel} /></td>
                    <td className="px-3 py-2.5 text-center font-black text-slate-700">{e.rr_simple ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{e.ale_pert_usd != null ? formatUSD(e.ale_pert_usd) : "—"}</td>
                    <td className="px-3 py-2.5 font-semibold capitalize text-slate-700">{e.estrategia_tratamiento || "—"}</td>
                    <td className="px-3 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${st.badge}`}>{freq}</span></td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-500">{ciclo?.responsable || "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{fmtFecha(e.creado_en)}</td>
                    <td className="px-3 py-2.5">
                      {!tiene ? (
                        <span className="rounded-full border border-orange-300 bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">⚠ Sin tratamiento</span>
                      ) : (
                        <button onClick={() => setPlan(e)} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:shadow ${ts.length ? (done === ts.length ? "border-green-300 bg-green-50 text-green-700" : "border-brand-300 bg-brand-50 text-brand-700") : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                          <Icon name="doc" className="h-3.5 w-3.5" />
                          {ts.length ? `${done}/${ts.length} tareas` : "Definir plan"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla informativa §9.1 */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
        <h3 className="font-bold text-brand-900">Ciclo de monitoreo continuo (§9.1)</h3>
        <p className="mb-3 mt-1 text-xs text-slate-500">
          El monitoreo de la evolución del riesgo sigue el ciclo PDCA (Plan-Do-Check-Act) integrado con ISO/IEC 27005:2022,
          estructurado en cuatro frecuencias de revisión que corresponden a los umbrales de riesgo definidos en la Fase 1.
          Estas actividades sirven como base del plan de cada escenario; el analista las adapta según los controles implementados.
        </p>
        <div className="overflow-x-auto rounded-lg border border-brand-100 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2 py-1.5">Frecuencia</th>
                <th className="px-2 py-1.5">Nivel de riesgo aplicable</th>
                <th className="px-2 py-1.5">Actividades de monitoreo</th>
                <th className="px-2 py-1.5">Disparadores de reevaluación PERT+MC</th>
                <th className="px-2 py-1.5">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {ciclos.map((c) => {
                const st = FREQ_STYLE[c.frecuencia] || FREQ_STYLE.Anual;
                return (
                  <tr key={c.id} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-1.5"><span className={`rounded-full border px-2 py-0.5 font-bold uppercase ${st.badge}`}>{c.frecuencia}</span></td>
                    <td className="px-2 py-1.5 font-semibold text-slate-700">{c.nivel_riesgo_aplicable}</td>
                    <td className="px-2 py-1.5 text-slate-600">{c.actividades}</td>
                    <td className="px-2 py-1.5 text-slate-600">{c.disparadores_reevaluacion}</td>
                    <td className="px-2 py-1.5 text-slate-500">{c.responsable}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: plan de monitoreo del escenario */}
      <Modal open={!!plan} onClose={() => { setPlan(null); setEditando(null); setNueva(""); }} wide title={plan ? `Plan de monitoreo · ${plan.codigo} — ${plan.nombre}` : ""}>
        {plan && (() => {
          const freq = frecuenciaDe(plan);
          const ciclo = cicloDe(plan);
          const st = FREQ_STYLE[freq];
          return (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${st.badge}`}>{freq}</span>
                <Nivel n={plan.nivel} />
                <span className="text-xs capitalize text-slate-500">Estrategia: <b>{plan.estrategia_tratamiento}</b></span>
                <span className="text-xs text-slate-400">· Responsable: {ciclo?.responsable || "—"}</span>
              </div>

              {ciclo && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  <b className="text-slate-600">Disparadores de reevaluación PERT+MC:</b> {ciclo.disparadores_reevaluacion}
                </div>
              )}

              {/* Progreso */}
              {tareasPlan.length > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Cumplimiento del plan</span><span className="font-bold">{hechas}/{tareasPlan.length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full transition-all ${hechas === tareasPlan.length ? "bg-green-500" : "bg-brand-500"}`} style={{ width: `${tareasPlan.length ? (hechas / tareasPlan.length) * 100 : 0}%` }} />
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-1.5">
                {tareasPlan.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                    <p className="mb-3 text-slate-500">Este escenario aún no tiene plan de monitoreo definido.</p>
                    <button onClick={() => generarMut.mutate(sugerirTareas(plan))} disabled={generarMut.isPending}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60">
                      {generarMut.isPending ? "Generando…" : "✨ Generar plan sugerido (controles + ciclo §9.1)"}
                    </button>
                  </div>
                )}
                {tareasPlan.map((t) => (
                  <div key={t.id} className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${t.completada ? "border-green-200 bg-green-50/60" : "border-slate-200"}`}>
                    <input type="checkbox" checked={t.completada} onChange={() => updMut.mutate({ id: t.id, p: { completada: !t.completada } })}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-green-600" />
                    {editando?.id === t.id ? (
                      <input autoFocus value={editando.texto} onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
                        onBlur={guardarEdicion} onKeyDown={(e) => { if (e.key === "Enter") guardarEdicion(); if (e.key === "Escape") setEditando(null); }}
                        className="flex-1 rounded border border-brand-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-100" />
                    ) : (
                      <span className={`flex-1 ${t.completada ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.descripcion}</span>
                    )}
                    <button onClick={() => setEditando({ id: t.id, texto: t.descripcion })} className="rounded p-1 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Editar">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </button>
                    <button onClick={() => { if (confirm("¿Eliminar esta tarea del plan?")) delMut.mutate(t.id); }} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Agregar tarea */}
              <div className="flex gap-2">
                <input value={nueva} onChange={(e) => setNueva(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
                  placeholder="Nueva tarea de monitoreo (ej. Revisar logs SIEM del portal de citas)…"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <button onClick={agregarTarea} disabled={!nueva.trim() || crearMut.isPending}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50">
                  Agregar
                </button>
              </div>
              {tareasPlan.length > 0 && (
                <button onClick={() => generarMut.mutate(sugerirTareas(plan))} disabled={generarMut.isPending}
                  className="text-xs font-semibold text-brand-600 hover:underline disabled:opacity-50">
                  {generarMut.isPending ? "Generando…" : "+ Añadir tareas sugeridas (controles + ciclo §9.1)"}
                </button>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
