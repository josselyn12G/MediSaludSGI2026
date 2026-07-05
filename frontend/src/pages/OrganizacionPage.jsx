import { useQuery } from "@tanstack/react-query";
import { fetchOrganizaciones, fetchProcesos } from "../api/resources";
import Icon from "../components/Icon";
import Badge from "../components/Badge";

const NIVEL_PROC = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Medio",
  bajo: "Bajo",
};

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-brand-900">{value || "—"}</p>
    </div>
  );
}

export default function OrganizacionPage() {
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const { data: procesos } = useQuery({ queryKey: ["procesos"], queryFn: fetchProcesos });
  const org = orgs?.[0];

  if (!org) return <p className="text-slate-500">Cargando organización…</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-400 to-brand-600 text-white">
          <Icon name="building" className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-brand-900">{org.nombre}</h1>
          <p className="text-slate-500">{org.sector} · {org.ciudad}, {org.pais}</p>
        </div>
      </div>

      {/* Contexto */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-brand-900">Contexto organizacional (ISO 27005 · Fase 1)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Tipo" value={org.tipo} />
          <Field label="Empleados" value={org.num_empleados} />
          <Field label="Usuarios de sistemas" value={org.num_usuarios_sistemas} />
          <Field label="Pacientes registrados" value={org.num_pacientes_registrados?.toLocaleString("es-EC")} />
          <Field label="Centros de atención" value={org.centros_atencion} />
          <Field label="Horizonte de evaluación" value={`${org.horizonte_evaluacion_meses} meses`} />
          <Field label="Resp. evaluación" value={org.responsable_evaluacion} />
          <Field label="Resp. seguridad" value={org.responsable_seguridad} />
          <Field label="Resp. cumplimiento" value={org.responsable_cumplimiento} />
          <Field label="Modalidad" value={org.modalidad_operacion} />
          <Field label="Regulaciones" value={org.regulaciones_aplicables} />
          <Field label="Fecha levantamiento" value={org.fecha_levantamiento} />
        </div>
      </section>

      {/* Marco metodológico */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-brand-900">Marco de referencia (Sección 3)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">Norma</th>
                <th className="px-3 py-2">Elemento incorporado</th>
                <th className="px-3 py-2">Aplicación en Medisalud</th>
              </tr>
            </thead>
            <tbody>
              {(org.marcos || []).map((m) => (
                <tr key={m.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-3 font-semibold text-brand-800">{m.norma}</td>
                  <td className="px-3 py-3 text-slate-600">{m.elemento_incorporado}</td>
                  <td className="px-3 py-3 text-slate-600">{m.aplicacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Procesos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-brand-900">Procesos de negocio (Sección 2.4)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Proceso</th>
                <th className="px-3 py-2">Responsable</th>
                <th className="px-3 py-2">Importancia</th>
              </tr>
            </thead>
            <tbody>
              {(procesos || []).map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-mono font-semibold text-brand-700">{p.codigo}</td>
                  <td className="px-3 py-3 text-slate-700">{p.nombre}</td>
                  <td className="px-3 py-3 text-slate-500">{p.responsable}</td>
                  <td className="px-3 py-3"><Badge nivel={NIVEL_PROC[p.nivel_importancia]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
