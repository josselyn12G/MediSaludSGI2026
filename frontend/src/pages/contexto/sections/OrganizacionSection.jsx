import ParametroFijo from "../components/ParametroFijo";
import Callout from "../components/Callout";

function SectionHeader({ titulo, subtitulo }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-black text-brand-900">{titulo}</h2>
        {subtitulo && <p className="text-sm text-slate-500">{subtitulo}</p>}
      </div>
      <ParametroFijo />
    </div>
  );
}

export default function OrganizacionSection({ org }) {
  if (!org) return null;
  const params = [
    ["Nombre y sector", `${org.nombre} · ${org.sector}`],
    ["Tamaño operativo", `${org.empleados} empleados · ${org.usuarios_sistemas} usuarios · ${org.pacientes_registrados?.toLocaleString("es-EC")} pacientes`],
    ["Infraestructura", org.infraestructura],
    ["Regulaciones aplicables", (org.regulaciones || []).join(" · ")],
    ["Horizonte de evaluación", org.horizonte_evaluacion],
    ["Enfoque de análisis seleccionado", org.enfoque_analisis],
    ["Responsable de la evaluación", org.responsables?.evaluacion],
  ];

  return (
    <section id="organizacion" className="space-y-6 scroll-mt-24">
      <SectionHeader titulo="4.1 · Comprensión de la organización"
        subtitulo="Contexto interno y externo de Medisalud Integral S.A." />

      {/* Bloque 1: Ficha */}
      <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
        <div className="space-y-2 text-sm">
          {[
            ["Organización", org.nombre], ["Sector", org.sector],
            ["País / Ciudad", `${org.ciudad}, ${org.pais}`], ["Tipo", org.tipo],
            ["Centros de atención", org.centros_atencion], ["Horizonte", org.horizonte_evaluacion],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-4 border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">{l}</span>
              <span className="text-right font-semibold text-brand-900">{v}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            [org.empleados, "Empleados"], [org.usuarios_sistemas, "Usuarios de sistemas"],
            [org.pacientes_registrados?.toLocaleString("es-EC"), "Pacientes"],
          ].map(([v, l]) => (
            <div key={l} className="grid place-items-center rounded-xl bg-brand-50 p-4 text-center">
              <p className="text-2xl font-black text-brand-700">{v}</p>
              <p className="mt-1 text-[11px] text-slate-500">{l}</p>
            </div>
          ))}
          <div className="col-span-3 flex flex-wrap gap-2">
            {(org.responsables ? Object.entries(org.responsables) : []).map(([rol, persona]) => (
              <span key={rol} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                <span className="capitalize text-slate-400">{rol}: </span>
                <span className="font-semibold text-slate-700">{persona}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bloque 2: Parámetros de contexto */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr><th className="px-4 py-3">Parámetro</th><th className="px-4 py-3">Configuración Medisalud Integral S.A.</th></tr>
          </thead>
          <tbody>
            {params.map(([p, v]) => (
              <tr key={p} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 font-semibold text-brand-800">{p}</td>
                <td className="px-4 py-3 text-slate-600">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bloque 3: Marco de referencia */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Marco / Norma</th>
              <th className="px-4 py-3">Elemento incorporado</th>
              <th className="px-4 py-3">Aplicación en Medisalud</th>
            </tr>
          </thead>
          <tbody>
            {(org.marcos_referencia || []).map((m) => (
              <tr key={m.marco} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 font-bold text-brand-800">{m.marco}</td>
                <td className="px-4 py-3 text-slate-600">{m.elemento}</td>
                <td className="px-4 py-3 text-slate-600">{m.aplicacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout tono="danger" titulo="Fundamento normativo SPDP">
        La Guía SPDP-SPD-2025-0003-R establece que los criterios cuantitativos de impacto deben respaldarse en
        rangos de pérdidas financieras. Medisalud, al procesar datos de salud de {org.pacientes_registrados?.toLocaleString("es-EC")} pacientes LOPDP, está directamente obligada a cumplir estos criterios.
      </Callout>
    </section>
  );
}
