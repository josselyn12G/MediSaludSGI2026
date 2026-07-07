import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchActivoStats, fetchAmenazas, fetchControles,
  fetchEscenariosRiesgo, fetchTareasMonitoreo, fetchVulnerabilidades,
} from "../api/resources";
import { formatUSD } from "../data/metodologia";
import Icon from "../components/Icon";

const NIVEL_COLORS = {
  Crítico: "#ef4444",
  Alto: "#f97316",
  Medio: "#eab308",
  Bajo: "#22c55e",
};
const RIESGO_COLORS = { critico: "#ef4444", alto: "#f97316", medio: "#eab308", bajo: "#22c55e" };
const ESTRATEGIA_COLORS = { mitigar: "#b62525", transferir: "#0e7490", aceptar: "#16a34a", evitar: "#ea580c" };
const FRECUENCIA_POR_NIVEL = { critico: "Semanal", alto: "Mensual", medio: "Trimestral", bajo: "Anual" };
const FREQ_TXT = {
  Semanal: "text-red-700 bg-red-50 border-red-200",
  Mensual: "text-orange-700 bg-orange-50 border-orange-200",
  Trimestral: "text-yellow-700 bg-yellow-50 border-yellow-200",
  Anual: "text-green-700 bg-green-50 border-green-200",
};

function StatCard({ icon, label, value, accent, sub }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${accent} opacity-10 transition group-hover:scale-150`} />
      <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl ${accent} text-white`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <p className="text-3xl font-black text-brand-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Seccion({ titulo, enlace, to, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-brand-900">{titulo}</h2>
        {to && <Link to={to} className="text-xs font-semibold text-brand-600 hover:underline">{enlace || "Ver módulo →"}</Link>}
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["activo-stats"], queryFn: fetchActivoStats });
  const { data: escenarios = [] } = useQuery({ queryKey: ["escenarios-riesgo"], queryFn: () => fetchEscenariosRiesgo() });
  const { data: amenazas = [] } = useQuery({ queryKey: ["amenazas"], queryFn: () => fetchAmenazas() });
  const { data: vulns = [] } = useQuery({ queryKey: ["vulnerabilidades"], queryFn: () => fetchVulnerabilidades() });
  const { data: controles = [] } = useQuery({ queryKey: ["controles"], queryFn: () => fetchControles() });
  const { data: tareas = [] } = useQuery({ queryKey: ["tareas-monitoreo"], queryFn: () => fetchTareasMonitoreo() });

  if (isLoading || !stats) {
    return <p className="text-slate-500">Cargando indicadores…</p>;
  }

  // --- Activos ---
  const pieData = Object.entries(stats.por_nivel || {}).filter(([k]) => k).map(([name, value]) => ({ name, value }));
  const barData = (stats.por_tipo || []).map((t) => ({ tipo: t.tipo, nombre: t.nombre, total: t.total }));

  // --- Riesgos ---
  const conTrat = escenarios.filter((e) => e.estrategia_tratamiento);
  const sinTrat = escenarios.length - conTrat.length;
  const aleTotal = escenarios.reduce((s, e) => s + (e.ale_pert_usd || 0), 0);
  const nivelesRiesgo = ["critico", "alto", "medio", "bajo"].map((n) => ({
    name: n, value: escenarios.filter((e) => e.nivel === n).length,
  })).filter((d) => d.value > 0);
  const estrategias = ["mitigar", "transferir", "aceptar", "evitar"].map((s) => ({
    name: s, total: conTrat.filter((e) => e.estrategia_tratamiento === s).length,
  }));

  // --- Catálogos ---
  const amenazasCriticas = amenazas.filter((a) => a.es_critica).length;
  const vulnSeveras = vulns.filter((v) => v.severidad >= 4).length;
  const ctrlEstados = {
    implementado: controles.filter((c) => c.estado === "implementado").length,
    parcial: controles.filter((c) => c.estado === "parcial").length,
    ausente: controles.filter((c) => c.estado === "ausente").length,
  };

  // --- Monitoreo ---
  const escConPlanTareas = new Set(tareas.map((t) => t.escenario));
  const tareasHechas = tareas.filter((t) => t.completada).length;
  const pctCumpl = tareas.length ? Math.round((tareasHechas / tareas.length) * 100) : 0;
  const porFrecuencia = ["Semanal", "Mensual", "Trimestral", "Anual"].map((f) => ({
    f, n: conTrat.filter((e) => FRECUENCIA_POR_NIVEL[e.nivel] === f).length,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Dashboard de Riesgos</h1>
        <p className="text-slate-500">Resumen ejecutivo del ciclo ISO 27005 · Medisalud Integral S.A.</p>
      </div>

      {/* ============ ESCENARIOS DE RIESGO ============ */}
      <Seccion titulo="Escenarios de riesgo y tratamiento" to="/riesgos">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon="calc" label="Escenarios de riesgo" value={escenarios.length} accent="bg-brand-600" sub={`${nivelesRiesgo.find((n) => n.name === "critico")?.value || 0} críticos · ${nivelesRiesgo.find((n) => n.name === "alto")?.value || 0} altos`} />
          <StatCard icon="chart" label="Exposición ALE_PERT total" value={formatUSD(aleTotal)} accent="bg-neutral-800" sub="Pérdida anual esperada del portafolio" />
          <StatCard icon="treat" label="Con plan de tratamiento" value={`${conTrat.length}/${escenarios.length}`} accent="bg-green-600" sub={sinTrat > 0 ? `⚠ ${sinTrat} sin tratamiento` : "Portafolio cubierto"} />
          <StatCard icon="monitor" label="Con plan de monitoreo" value={`${escConPlanTareas.size}/${conTrat.length}`} accent="bg-brand-700" sub={`Cumplimiento de tareas: ${pctCumpl}%`} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-brand-900">Riesgos por nivel (RR = P × I)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={nivelesRiesgo} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}
                  label={(e) => `${e.name}: ${e.value}`}>
                  {nivelesRiesgo.map((d) => <Cell key={d.name} fill={RIESGO_COLORS[d.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-brand-900">Tratamientos por estrategia (§8.1)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={estrategias} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} width={80} />
                <Tooltip formatter={(v) => [`${v} escenarios`, "Total"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                  {estrategias.map((d) => <Cell key={d.name} fill={ESTRATEGIA_COLORS[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Seccion>

      {/* ============ CATÁLOGOS ============ */}
      <Seccion titulo="Amenazas, vulnerabilidades y controles" to="/amenazas">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-slate-700">Amenazas (MAGERIT §5.2)</p>
              <Icon name="threats" className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-black text-brand-900">{amenazas.length}</p>
            <p className="mt-1 text-xs text-slate-500">
              <b className="text-red-600">{amenazasCriticas} críticas LOPDP</b> (notificación SPDP 72h / EIPD) · 4 grupos N/I/E/A
            </p>
            <Link to="/amenazas" className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline">Ver catálogo →</Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-slate-700">Vulnerabilidades (§5.3)</p>
              <Icon name="bolt" className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-black text-brand-900">{vulns.length}</p>
            <p className="mt-1 text-xs text-slate-500">
              <b className="text-orange-600">{vulnSeveras} de severidad Alta/Muy Alta</b> (D ≥ 0.8) · grupos VT/VO/VP
            </p>
            <Link to="/vulnerabilidades" className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline">Ver catálogo →</Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-slate-700">Controles (ISO 27002)</p>
              <Icon name="lock" className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-black text-brand-900">{controles.length}</p>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              {controles.length > 0 && (
                <>
                  <div className="bg-green-500" style={{ width: `${(ctrlEstados.implementado / controles.length) * 100}%` }} />
                  <div className="bg-yellow-400" style={{ width: `${(ctrlEstados.parcial / controles.length) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(ctrlEstados.ausente / controles.length) * 100}%` }} />
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              <b className="text-green-600">{ctrlEstados.implementado} implementados</b> · <b className="text-yellow-600">{ctrlEstados.parcial} parciales</b> · <b className="text-red-600">{ctrlEstados.ausente} ausentes</b>
            </p>
            <Link to="/controles" className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline">Ver catálogo →</Link>
          </div>
        </div>
      </Seccion>

      {/* ============ MONITOREO Y CONTINUIDAD ============ */}
      <Seccion titulo="Monitoreo continuo y continuidad (§9.1 · PDCA)" to="/monitoreo">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Escenarios por frecuencia de revisión</p>
              <div className="flex flex-wrap gap-2">
                {porFrecuencia.map(({ f, n }) => (
                  <span key={f} className={`rounded-xl border px-3 py-2 text-sm font-bold ${FREQ_TXT[f]}`}>
                    {f}: {n}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">La frecuencia se asigna por nivel: Crítico→Semanal · Alto→Mensual · Medio→Trimestral · Bajo→Anual.</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Cumplimiento global de los planes de monitoreo</p>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${pctCumpl === 100 ? "bg-green-500" : "bg-brand-500"}`} style={{ width: `${pctCumpl}%` }} />
                </div>
                <span className="text-sm font-black text-brand-900">{pctCumpl}%</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {tareasHechas} de {tareas.length} tareas cumplidas · {escConPlanTareas.size} de {conTrat.length} escenarios tratados tienen plan definido
                {conTrat.length - escConPlanTareas.size > 0 && <b className="text-orange-600"> · ⚠ {conTrat.length - escConPlanTareas.size} sin plan</b>}
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      {/* ============ ACTIVOS ============ */}
      <Seccion titulo="Inventario de activos (Fase 2)" to="/activos">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon="assets" label="Activos registrados" value={stats.total} accent="bg-brand-600" sub={`VA promedio: ${stats.va_promedio}`} />
          <StatCard icon="threats" label="Críticos (NC-5)" value={stats.criticos} accent="bg-red-500" />
          <StatCard icon="bolt" label="Altos (NC-4)" value={stats.altos} accent="bg-orange-500" />
          <StatCard icon="check" label="Medios + Bajos" value={stats.medios + stats.bajos} accent="bg-green-500" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-brand-900">Activos por tipo (MAGERIT)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="tipo" type="category" stroke="#475569" fontSize={12} width={48} />
                <Tooltip formatter={(v, _n, p) => [`${v} activos`, p.payload.nombre]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#b62525" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-brand-900">Distribución por nivel de criticidad</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}
                  label={(e) => `${e.name}: ${e.value}`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={NIVEL_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Seccion>
    </div>
  );
}
