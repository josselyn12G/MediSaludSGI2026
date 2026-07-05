import { useQuery } from "@tanstack/react-query";
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
import { fetchActivoStats } from "../api/resources";
import Icon from "../components/Icon";

const NIVEL_COLORS = {
  Crítico: "#ef4444",
  Alto: "#f97316",
  Medio: "#eab308",
  Bajo: "#22c55e",
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

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["activo-stats"],
    queryFn: fetchActivoStats,
  });

  if (isLoading || !stats) {
    return <p className="text-slate-500">Cargando indicadores…</p>;
  }

  const pieData = Object.entries(stats.por_nivel || {})
    .filter(([k]) => k)
    .map(([name, value]) => ({ name, value }));

  const barData = (stats.por_tipo || []).map((t) => ({
    tipo: t.tipo,
    nombre: t.nombre,
    total: t.total,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Dashboard de Riesgos</h1>
        <p className="text-slate-500">
          Resumen cuantitativo del inventario de activos · Medisalud Integral S.A.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="assets" label="Activos registrados" value={stats.total} accent="bg-brand-600" sub={`VA promedio: ${stats.va_promedio}`} />
        <StatCard icon="threats" label="Críticos (NC-5)" value={stats.criticos} accent="bg-red-500" />
        <StatCard icon="bolt" label="Altos (NC-4)" value={stats.altos} accent="bg-orange-500" />
        <StatCard icon="check" label="Medios + Bajos" value={stats.medios + stats.bajos} accent="bg-green-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-900">Activos por tipo (MAGERIT)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="tipo" type="category" stroke="#475569" fontSize={12} width={48} />
              <Tooltip
                formatter={(v, _n, p) => [`${v} activos`, p.payload.nombre]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#b62525" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-900">Distribución por nivel de criticidad</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                label={(e) => `${e.name}: ${e.value}`}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={NIVEL_COLORS[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
