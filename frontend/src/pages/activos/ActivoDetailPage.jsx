import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { fetchActivo } from "../../api/resources";
import { CLASIFICACION_NC, DESCRIPTOR_NIVEL, DIMENSIONES, ESCALA_VALORACION } from "../../data/metodologia";
import Badge from "../../components/Badge";
import Icon from "../../components/Icon";
import HeatMap5x5 from "../../components/HeatMap5x5";

export default function ActivoDetailPage() {
  const { id } = useParams();
  const { data: a, isLoading } = useQuery({
    queryKey: ["activo", id],
    queryFn: () => fetchActivo(id),
  });

  if (isLoading || !a) return <p className="text-slate-500">Cargando activo…</p>;

  const esAD = a.tipo_formula === "VAD";
  const dimsActivas = DIMENSIONES.filter(
    (d) => esAD || !["dim_exposicion", "dim_sensibilidad"].includes(d.key)
  );

  const radarData = dimsActivas
    .filter((d) => a[d.key] != null)
    .map((d) => ({ dim: d.cod, valor: a[d.key] }));

  const ancla = (val) => ESCALA_VALORACION.find((e) => e.valor === val)?.ancla || "—";
  const impacto = Math.max(a.dim_confidencialidad, a.dim_integridad, a.dim_disponibilidad);
  const ncActivo = a.clasificacion || a.clasificacion_nc;
  const clasif = CLASIFICACION_NC[ncActivo];

  return (
    <div className="space-y-6">
      <Link to="/activos" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-brand-700">
        ← Volver al inventario
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-400 to-brand-600 text-white">
            <Icon name="assets" className="h-7 w-7" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-brand-600">{a.codigo}</p>
            <h1 className="text-2xl font-black text-brand-900">{a.nombre}</h1>
            <p className="text-sm text-slate-500">{a.tipo_nombre} · {a.proceso_codigo || "sin proceso"}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-400">{esAD ? "VAD" : "VAG"}</p>
            <p className="text-3xl font-black text-brand-900">{esAD ? a.vad_score : a.vag_score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">VA (1–5)</p>
            <p className="text-3xl font-black text-brand-900">{a.va_normalizado}</p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-xs text-slate-400">Nivel · {a.clasificacion_nc}</p>
            <Badge nivel={a.nivel_criticidad} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ficha */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-brand-900">Ficha del activo</h2>
          {[
            ["Propietario", a.propietario],
            ["Custodio técnico", a.custodio_tecnico],
            ["Ubicación", a.ubicacion],
            ["Proceso asociado", a.proceso_nombre],
            ["Estado", a.estado],
            ["Datos de salud (LOPDP)", a.procesa_datos_salud ? "Sí · C=5 automático" : "No"],
            ["Última actualización", new Date(a.actualizado_en).toLocaleString("es-EC")],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-3 border-b border-slate-50 pb-2 text-sm">
              <span className="text-slate-400">{l}</span>
              <span className="text-right font-medium text-slate-700">{v || "—"}</span>
            </div>
          ))}
        </div>

        {/* Radar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-bold text-brand-900">Perfil multidimensional</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: "#475569", fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Radar dataKey="valor" stroke="#b62525" fill="#cf3a3a" fillOpacity={0.45} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Heat map */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-bold text-brand-900">Posición en mapa de calor 5×5</h2>
          <p className="mb-3 text-xs text-slate-400">
            Impacto I = máx(C={a.dim_confidencialidad}, I={a.dim_integridad}, D={a.dim_disponibilidad}) = <b>{impacto}</b>.
            Posición indicativa (P = VA = {a.va_normalizado}).
          </p>
          <HeatMap5x5 highlight={{ p: a.va_normalizado, i: impacto }} />
        </div>
      </div>

      {/* Clasificación de activos (§5.1.3) */}
      {clasif && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-brand-900">Clasificación del activo (§5.1.3)</h2>
            <span className={`rounded-full border px-3 py-1 text-sm font-bold ${clasif.color}`}>{ncActivo} · {clasif.nombre}</span>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">Criterio de asignación</p><p className="mt-1 text-slate-600">{clasif.criterio}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">Aspectos considerados</p><p className="mt-1 text-slate-600">{clasif.aspectos}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">Controles sugeridos</p><p className="mt-1 text-slate-600">{clasif.controles}</p></div>
          </div>

          {/* Escala de referencia NC-1…NC-5 */}
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2">Nivel</th><th className="px-3 py-2">Clasificación</th><th className="px-3 py-2">Criterio</th></tr>
              </thead>
              <tbody>
                {Object.entries(CLASIFICACION_NC).map(([nc, c]) => (
                  <tr key={nc} className={`border-t border-slate-100 ${nc === ncActivo ? "bg-brand-50/60 font-semibold" : ""}`}>
                    <td className="px-3 py-2 font-mono font-bold text-brand-700">{nc}{nc === ncActivo && " ◄"}</td>
                    <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 ${c.color}`}>{c.nombre}</span></td>
                    <td className="px-3 py-2 text-slate-500">{c.criterio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">La clasificación NC se deriva del Valor del Activo (VA): NC-5↔VA5 … NC-1↔VA1 (tablas §5.1.8 / §5.1.12).</p>
        </div>
      )}

      {/* Tabla de dimensiones con anclas USD */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-brand-900">Valoración por dimensión (§4.2 / §5.1.6) — anclas en USD</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">Dimensión</th>
              <th className="px-3 py-2 text-center">Valor</th>
              <th className="px-3 py-2">Descriptor</th>
              <th className="px-3 py-2">Ancla económica</th>
              <th className="px-3 py-2">Pregunta guía</th>
            </tr>
          </thead>
          <tbody>
            {dimsActivas.map((d) => {
              const val = a[d.key];
              return (
                <tr key={d.key} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-3 font-semibold text-brand-800">[{d.cod}] {d.nombre}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">{val}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{DESCRIPTOR_NIVEL[val]}</td>
                  <td className="px-3 py-3 font-medium text-slate-700">{ancla(val)}</td>
                  <td className="px-3 py-3 text-xs text-slate-400">{d.pregunta}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles mínimos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 font-bold text-brand-900">
          <Icon name="lock" className="h-5 w-5 text-brand-600" /> Controles mínimos requeridos
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">{a.controles_minimos}</p>
        {a.notas && (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-500"><b>Notas:</b> {a.notas}</p>
        )}
      </div>
    </div>
  );
}
