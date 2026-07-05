import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchContexto } from "../../api/resources";
import Icon from "../../components/Icon";
import OrganizacionSection from "./sections/OrganizacionSection";
import ImpactoSection from "./sections/ImpactoSection";
import ProbabilidadSection from "./sections/ProbabilidadSection";
import AceptacionSection from "./sections/AceptacionSection";
import MapaCalorSection from "./sections/MapaCalorSection";
import FormulasSection from "./sections/FormulasSection";

const TABS = [
  { id: "organizacion", label: "Organización" },
  { id: "impacto", label: "Impacto CIA" },
  { id: "probabilidad", label: "Probabilidad TEF" },
  { id: "aceptacion", label: "Aceptación" },
  { id: "mapa-calor", label: "Mapa de calor" },
  { id: "formulas", label: "Fórmulas" },
];

export default function ContextoPage() {
  const [tab, setTab] = useState("organizacion");
  const { data, isLoading, isError } = useQuery({ queryKey: ["contexto"], queryFn: fetchContexto });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400">
        Inicio <span className="mx-1">›</span> <span className="font-semibold text-brand-600">Fase 1 · Contexto</span>
      </p>

      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-red-200">ISO/IEC 27005:2022 · Fase 1</p>
        <h1 className="mt-1 text-2xl font-black">Establecimiento del Contexto</h1>
        <p className="mt-2 max-w-3xl text-sm text-red-50">
          Estos parámetros son la base cuantitativa de toda la metodología. De ellos dependen el cálculo de
          RI, RR, ALE y la posición en el mapa de calor.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["ISO/IEC 27005:2022 §6", "MAGERIT v3.0", "FAIR", "PERT"].map((b) => (
            <span key={b} className="rounded-full bg-black/20 px-3 py-1 text-[11px] font-semibold">{b}</span>
          ))}
        </div>
      </div>

      {/* Tabs internos */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {isLoading && (
        <p className="flex items-center gap-2 py-10 text-slate-400">
          <Icon name="spark" className="h-5 w-5 animate-spin" /> Cargando parámetros de contexto…
        </p>
      )}
      {isError && <p className="py-10 text-center text-red-500">No se pudo cargar el contexto. Inicia sesión e inténtalo de nuevo.</p>}

      {data && (
        <>
          {tab === "organizacion" && <OrganizacionSection org={data.organizacion} />}
          {tab === "impacto" && <ImpactoSection impacto={data.criterios_impacto} />}
          {tab === "probabilidad" && <ProbabilidadSection probabilidad={data.criterios_probabilidad} />}
          {tab === "aceptacion" && <AceptacionSection aceptacion={data.criterios_aceptacion} />}
          {tab === "mapa-calor" && <MapaCalorSection mapa={data.mapa_calor} />}
          {tab === "formulas" && <FormulasSection formulas={data.formulas} />}
        </>
      )}
    </div>
  );
}
