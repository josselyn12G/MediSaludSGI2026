import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { consultarIA, fetchEscenariosRiesgo, fetchOrganizaciones, getIaKey } from "../api/resources";
import { formatUSD } from "../data/metodologia";
import Icon from "../components/Icon";

const hoy = new Date().toISOString().slice(0, 10);

export default function InformePage() {
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const { data: escenarios = [] } = useQuery({ queryKey: ["escenarios-riesgo"], queryFn: () => fetchEscenariosRiesgo() });
  const org = orgs?.[0];

  const [sel, setSel] = useState({}); // id -> bool
  const [cfg, setCfg] = useState({ fecha: hoy, preparado: "", dirigido: "Gerencia General y Directorio" });
  const [narrativa, setNarrativa] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  // Por defecto: críticos y altos
  const elegidos = useMemo(() => {
    const ids = Object.keys(sel);
    if (!ids.length) return escenarios.filter((e) => e.nivel === "critico" || e.nivel === "alto");
    return escenarios.filter((e) => sel[e.id]);
  }, [sel, escenarios]);

  const aleTotal = elegidos.reduce((s, e) => s + (e.ale_pert_usd || 0), 0);
  const aleP90 = elegidos.reduce((s, e) => s + (e.ale_p90_usd || 0), 0);
  const nCrit = elegidos.filter((e) => e.nivel === "critico").length;
  const nAlto = elegidos.filter((e) => e.nivel === "alto").length;

  const generar = async () => {
    if (!getIaKey()) { setError("Sin API key. Ve a Configuración IA."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        fecha: cfg.fecha, preparado_por: cfg.preparado, dirigido_a: cfg.dirigido,
        n_escenarios: elegidos.length, n_criticos: nCrit, n_altos: nAlto,
        ale_total: Math.round(aleTotal), ale_p90_total: Math.round(aleP90),
        criticos: elegidos.filter((e) => e.nivel === "critico").slice(0, 6).map((e) => `${e.amenaza_codigo}×${e.vulnerabilidad_codigo} (${e.activo_codigo}): ALE ${formatUSD(e.ale_pert_usd)}, P90 ${formatUSD(e.ale_p90_usd)}`),
        tratamientos: elegidos.filter((e) => e.estrategia_tratamiento).slice(0, 6).map((e) => `${e.amenaza_codigo}×${e.vulnerabilidad_codigo}: ${e.estrategia_tratamiento}`),
      };
      const r = await consultarIA("informe_ejecutivo", payload);
      setNarrativa(r.respuesta || "");
    } catch (e) { setError(e?.response?.data?.error || e?.message || "Error IA."); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Controles (no se imprimen) */}
      <div className="no-print space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-2xl font-black text-brand-900">Informe Ejecutivo</h1>
            <p className="text-slate-500">Narrativa IA en texto plano + anexos · exportable a PDF</p></div>
          <div className="flex gap-2">
            <button onClick={generar} disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Icon name="ai" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {loading ? "Generando…" : "🤖 Generar narrativa"}</button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"><Icon name="doc" className="h-4 w-4" /> Exportar PDF</button>
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          <input type="date" value={cfg.fecha} onChange={(e) => setCfg((c) => ({ ...c, fecha: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={cfg.preparado} onChange={(e) => setCfg((c) => ({ ...c, preparado: e.target.value }))} placeholder="Preparado por" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={cfg.dirigido} onChange={(e) => setCfg((c) => ({ ...c, dirigido: e.target.value }))} placeholder="Dirigido a" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-sm font-semibold text-slate-600">Escenarios incluidos ({elegidos.length}) — por defecto críticos y altos</p>
          <div className="grid max-h-40 grid-cols-1 gap-1 overflow-auto sm:grid-cols-2">
            {escenarios.map((e) => (
              <label key={e.id} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={elegidos.some((x) => x.id === e.id)} onChange={() => setSel((s) => ({ ...s, [e.id]: !elegidos.some((x) => x.id === e.id) }))} className="h-3.5 w-3.5 accent-brand-600" />
                <b className="font-mono text-brand-700">{e.amenaza_codigo}×{e.vulnerabilidad_codigo}</b> {e.nivel}</label>
            ))}
          </div>
        </div>
      </div>

      {/* INFORME imprimible */}
      <div className="report rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="border-b-2 border-brand-600 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Informe Ejecutivo · Gestión de Riesgos Cibernéticos</p>
          <h1 className="text-2xl font-black text-brand-900">{org?.nombre || "Medisalud Integral S.A."}</h1>
          <p className="text-sm text-slate-500">{cfg.fecha} · Dirigido a: {cfg.dirigido}{cfg.preparado ? ` · Preparado por: ${cfg.preparado}` : ""}</p>
        </div>

        {/* Perfil de riesgo */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Escenarios", elegidos.length], ["Críticos", nCrit], ["ALE total/año", formatUSD(aleTotal)], ["ALE P90/año", formatUSD(aleP90)]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-[11px] text-slate-400">{l}</p><p className="text-lg font-black text-brand-900">{v}</p></div>
          ))}
        </div>

        {/* Narrativa IA */}
        <div className="mt-6">
          <h2 className="mb-2 font-bold text-brand-900">1. Narrativa ejecutiva</h2>
          {narrativa ? <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{narrativa}</pre>
            : <p className="text-sm italic text-slate-400">Genera la narrativa con el botón “Generar narrativa”.</p>}
        </div>

        {/* Anexo A: escenarios */}
        <div className="mt-6">
          <h2 className="mb-2 font-bold text-brand-900">Anexo A · Escenarios de riesgo</h2>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-2 py-1.5">Escenario</th><th className="px-2 py-1.5">Activo</th><th className="px-2 py-1.5 text-center">RR</th><th className="px-2 py-1.5">Nivel</th><th className="px-2 py-1.5 text-right">ALE_PERT</th><th className="px-2 py-1.5 text-right">P90</th></tr></thead>
            <tbody>{elegidos.map((e) => (
              <tr key={e.id} className="border-t border-slate-100"><td className="px-2 py-1.5 font-mono font-bold text-brand-700">{e.amenaza_codigo}×{e.vulnerabilidad_codigo}</td><td className="px-2 py-1.5">{e.activo_codigo}</td><td className="px-2 py-1.5 text-center font-bold">{e.rr_simple}</td><td className="px-2 py-1.5 capitalize">{e.nivel}</td><td className="px-2 py-1.5 text-right">{formatUSD(e.ale_pert_usd)}</td><td className="px-2 py-1.5 text-right">{formatUSD(e.ale_p90_usd)}</td></tr>))}</tbody>
          </table>
        </div>

        {/* Anexo B: tratamientos */}
        <div className="mt-6">
          <h2 className="mb-2 font-bold text-brand-900">Anexo B · Planes de tratamiento</h2>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-2 py-1.5">Escenario</th><th className="px-2 py-1.5">Estrategia</th><th className="px-2 py-1.5">Controles</th><th className="px-2 py-1.5 text-right">Costo/año</th><th className="px-2 py-1.5">Aprobado por</th></tr></thead>
            <tbody>{elegidos.filter((e) => e.estrategia_tratamiento).map((e) => (
              <tr key={e.id} className="border-t border-slate-100"><td className="px-2 py-1.5 font-mono font-bold text-brand-700">{e.amenaza_codigo}×{e.vulnerabilidad_codigo}</td><td className="px-2 py-1.5 capitalize">{e.estrategia_tratamiento}</td><td className="px-2 py-1.5">{(e.controles_info || []).map((c) => c.codigo).join(", ") || "—"}</td><td className="px-2 py-1.5 text-right">{e.costo_control_estimado_usd ? formatUSD(e.costo_control_estimado_usd) : "—"}</td><td className="px-2 py-1.5">{e.aprobado_por || "—"}</td></tr>))}</tbody>
          </table>
        </div>

        <p className="mt-8 border-t border-slate-100 pt-3 text-[10px] text-slate-400">ISO/IEC 27005:2022 · MAGERIT v3.0 · FAIR · Monte Carlo · LOPDP Ecuador. Documento generado por GRM Medisalud.</p>
      </div>
    </div>
  );
}
