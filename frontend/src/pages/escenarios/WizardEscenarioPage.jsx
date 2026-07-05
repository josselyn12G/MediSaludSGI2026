import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  calcularEscenario, consultarIA, createEscenarioRiesgo, fetchActivos, fetchAmenazas,
  fetchControles, fetchOrganizaciones, fetchVulnerabilidades, getIaKey,
  patchEscenarioTef, patchEscenarioTratamiento,
} from "../../api/resources";
import { CRITERIOS_ACEPTACION, ESTRATEGIAS_INTRO, ESTRATEGIAS_TRATAMIENTO, formatUSD, GRUPOS_AMENAZA, GRUPOS_VULN, LM_POR_IMPACTO, NIVEL_STYLES, VALOR_HEAT } from "../../data/metodologia";
import Icon from "../../components/Icon";
import WizardFormula from "../../components/WizardFormula";

const PASOS = ["Activo", "Amenazas", "Vulnerab.", "Controles", "TEF", "LM + Fórmula", "Cálculo", "Priorización", "Tratamiento", "Resumen"];
const NIVEL_CLS = {
  critico: "bg-red-100 text-red-800 border-red-300", alto: "bg-orange-100 text-orange-800 border-orange-300",
  medio: "bg-yellow-100 text-yellow-800 border-yellow-300", bajo: "bg-green-100 text-green-800 border-green-300",
};
const Nivel = ({ n }) => <span className={`rounded-full border px-2 py-0.5 text-xs font-bold capitalize ${NIVEL_CLS[n] || "bg-slate-100"}`}>{n || "—"}</span>;
const lmDe = (nivel) => LM_POR_IMPACTO.find((l) => l.i === nivel) || LM_POR_IMPACTO[0];
const asociada = (am, ac) => !!ac && (am.activos || []).includes(ac.id);

function MiniHeat({ p, i }) {
  return <div className="inline-block">{[5, 4, 3, 2, 1].map((r) => (
    <div key={r} className="flex">{[1, 2, 3, 4, 5].map((c) => {
      const rr = r * c; const h = rr >= 20 ? VALOR_HEAT[5] : rr >= 12 ? VALOR_HEAT[4] : rr >= 6 ? VALOR_HEAT[3] : VALOR_HEAT[1];
      return <div key={c} className={`m-0.5 grid h-8 w-8 place-items-center rounded text-[10px] font-bold text-white ${h.bg} ${r === p && c === i ? "ring-4 ring-brand-900" : "opacity-50"}`}>{rr}</div>;
    })}</div>))}</div>;
}

function IAPanel({ titulo, tipo, payload }) {
  const [text, setText] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const go = async () => {
    if (!getIaKey()) { setError("Sin API key. Ve a Configuración IA."); return; }
    setLoading(true); setError("");
    try { const r = await consultarIA(tipo, payload); setText(r.respuesta || "(sin respuesta)"); }
    catch (e) { setError(e?.response?.data?.error || e?.message || "Error IA."); } finally { setLoading(false); }
  };
  return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
    <div className="mb-2 flex items-center justify-between"><p className="font-bold text-brand-900">{titulo}</p>
      <button onClick={go} disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
        <Icon name="ai" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {loading ? "Consultando…" : "🤖 ChatGPT"}</button></div>
    {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    {text && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-slate-700">{text}</pre>}
  </div>;
}

const Search = ({ v, set, ph }) => (
  <div className="relative"><Icon name="search" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
    <input value={v} onChange={(e) => set(e.target.value)} placeholder={ph} className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500" /></div>
);

export default function WizardEscenarioPage() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [activo, setActivo] = useState(null);
  const [amSel, setAmSel] = useState([]); const [vuSel, setVuSel] = useState([]); const [ctSel, setCtSel] = useState([]);
  const [tefMap, setTefMap] = useState({}); // {amId:{o,mp,p}}
  const [justif, setJustif] = useState("");
  const [calcs, setCalcs] = useState([]);
  const [tratMap, setTratMap] = useState({}); // {escId: {estrategia, controles, costo, decision}}
  const [aprobado, setAprobado] = useState("");
  const [escIdx, setEscIdx] = useState(0); // escenario visible en las gráficas del Paso 7
  const [busy, setBusy] = useState(false);
  const [qAct, setQAct] = useState(""); const [gAct, setGAct] = useState(""); const [qAm, setQAm] = useState(""); const [gAm, setGAm] = useState("");
  const [qVu, setQVu] = useState(""); const [gVu, setGVu] = useState(""); const [qCt, setQCt] = useState("");

  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;
  const { data: activos = [] } = useQuery({ queryKey: ["activos"], queryFn: () => fetchActivos() });
  const { data: amenazas = [] } = useQuery({ queryKey: ["amenazas"], queryFn: () => fetchAmenazas() });
  const { data: vulns = [] } = useQuery({ queryKey: ["vulnerabilidades"], queryFn: () => fetchVulnerabilidades() });
  const { data: controles = [] } = useQuery({ queryKey: ["controles"], queryFn: () => fetchControles() });

  const tiposActivo = [...new Set(activos.map((a) => a.tipo_codigo).filter(Boolean))];
  const tipoNombre = Object.fromEntries(activos.map((a) => [a.tipo_codigo, a.tipo_nombre]));
  const actFil = activos.filter((a) => (!gAct || a.tipo_codigo === gAct) && `${a.codigo} ${a.nombre}`.toLowerCase().includes(qAct.toLowerCase()));
  const amFil = amenazas.filter((a) => (!gAm || a.grupo === gAm) && `${a.codigo} ${a.nombre}`.toLowerCase().includes(qAm.toLowerCase()));
  const vuFil = vulns.filter((v) => (!gVu || v.grupo === gVu) && `${v.codigo} ${v.nombre}`.toLowerCase().includes(qVu.toLowerCase()));
  const ctFil = controles.filter((c) => `${c.codigo} ${c.nombre}`.toLowerCase().includes(qCt.toLowerCase()));

  const elegirActivo = (a) => { setActivo(a); setAmSel(amenazas.filter((am) => asociada(am, a)).map((am) => am.id)); };
  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const amObjs = amenazas.filter((a) => amSel.includes(a.id));
  const vuObjs = vulns.filter((v) => vuSel.includes(v.id));
  const ctObjs = controles.filter((c) => ctSel.includes(c.id));
  const ctrlEfectivo = ctObjs.slice().sort((a, b) => (a.frc ?? 1) - (b.frc ?? 1))[0] || null; // mejor control (menor FRC)
  const frcEfectivo = ctrlEfectivo ? ctrlEfectivo.frc : 1.0;
  const vuSugeridas = useMemo(
    () => new Set(vulns.filter((v) => (v.amenazas || []).some((id) => amSel.includes(id))).map((v) => v.id)),
    [amSel, vulns]
  );
  const ctSugeridos = useMemo(
    () => new Set(controles.filter((c) => (c.vulnerabilidades || []).some((id) => vuSel.includes(id))).map((c) => c.id)),
    [vuSel, controles]
  );

  // Inicializa TEF editable desde el catálogo al entrar al paso 5
  const initTef = () => setTefMap((m) => {
    const n = { ...m };
    amObjs.forEach((a) => { if (!n[a.id]) n[a.id] = { o: a.f_o, mp: a.f_mp, p: a.f_p }; });
    return n;
  });
  const setTefVal = (id, k, v) => setTefMap((m) => ({ ...m, [id]: { ...m[id], [k]: v } }));

  const calcular = async () => {
    setBusy(true);
    try {
      const res = [];
      for (const am of amObjs) {
        const t = tefMap[am.id] || { o: am.f_o, mp: am.f_mp, p: am.f_p };
        for (const vu of vuObjs) {
          const esc = await createEscenarioRiesgo({
            organizacion: orgId, nombre: `${am.codigo}×${vu.codigo} / ${activo.codigo}`,
            activo: activo.id, amenaza: am.id, vulnerabilidad: vu.id, control_existente: ctrlEfectivo?.id || null,
          });
          await patchEscenarioTef(esc.id, { tef_o_analista: Number(t.o), tef_mp_analista: Number(t.mp), tef_p_analista: Number(t.p), justificacion_tef: justif });
          const r = await calcularEscenario(esc.id, 10000);
          res.push({ ...r, _am: am, _vu: vu });
        }
      }
      setCalcs(res); setEscIdx(0); setPaso(7);
    } finally { setBusy(false); }
  };

  const tratDe = (id) => tratMap[id] || { estrategia: "", controles: [], costo: "", decision: "" };
  const setTratEsc = (id, patch) => setTratMap((m) => ({ ...m, [id]: { ...tratDe(id), ...patch } }));
  const tratCompleto = calcs.length > 0 && calcs.every((c) => tratDe(c.id).estrategia);

  const guardarTrat = async () => {
    setBusy(true);
    try {
      for (const c of calcs) {
        const t = tratDe(c.id);
        await patchEscenarioTratamiento(c.id, { estrategia_tratamiento: t.estrategia, controles_propuestos: t.controles, costo_control_estimado_usd: t.costo ? Number(t.costo) : null, decision_analista: t.decision, aprobado_por: aprobado });
      }
      setPaso(10);
    } finally { setBusy(false); }
  };

  const aleTotal = calcs.reduce((s, c) => s + (c.ale_pert_usd || 0), 0);
  const histo = useMemo(() => { const s = calcs[escIdx]?.simulacion; if (!s?.histograma) return []; return s.histograma.map((count, k) => ({ x: Math.round((s.histograma_edges[k] + s.histograma_edges[k + 1]) / 2), count })); }, [calcs, escIdx]);
  const puede = { 1: !!activo, 2: amSel.length > 0, 3: vuSel.length > 0, 4: true, 5: justif.trim() !== "", 6: true };
  const cont = () => {
    const nx = paso + 1;
    if (nx === 3) setVuSel((prev) => [...new Set([...prev, ...vuSugeridas])]);
    if (nx === 4) setCtSel((prev) => [...new Set([...prev, ...ctSugeridos])]);
    if (nx === 5) initTef();
    setPaso(nx);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-brand-900">Nuevo Escenario de Riesgo</h1>
        <p className="text-slate-500">10 pasos · selección múltiple · ISO 27005 + MAGERIT + Monte Carlo</p></div>

      <div className="flex flex-wrap gap-1.5">{PASOS.map((l, i) => { const n = i + 1; return (
        <div key={n} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${n === paso ? "bg-brand-600 text-white" : n < paso ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400"}`}>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/30 text-[10px]">{n < paso ? "✓" : n}</span>{l}</div>); })}</div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* 1 ACTIVO */}
        {paso === 1 && (<div className="space-y-3"><h2 className="font-bold text-brand-900">Paso 1 · Activo</h2>
          <Search v={qAct} set={setQAct} ph="Buscar activo…" />
          <select value={gAct} onChange={(e) => setGAct(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Todas las categorías de activo</option>
            {tiposActivo.map((t) => <option key={t} value={t}>{tipoNombre[t] ? `${t} · ${tipoNombre[t]}` : t}</option>)}
          </select>
          <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">{actFil.map((a) => (
            <button key={a.id} onClick={() => elegirActivo(a)} className={`flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-brand-50/50 ${activo?.id === a.id ? "bg-brand-100" : ""}`}>
              <span><b className="font-mono text-brand-700">{a.codigo}</b> {a.nombre}</span>
              <span className="text-xs text-slate-400">VA {a.va_normalizado} · C{a.dim_confidencialidad}/I{a.dim_integridad}/D{a.dim_disponibilidad}{a.procesa_datos_salud ? " · LOPDP" : ""}</span></button>))}</div>
          {activo && <p className="text-xs text-slate-500">Amenazas asociadas a {activo.codigo} preseleccionadas según tu metodología.</p>}</div>)}

        {/* 2 AMENAZAS */}
        {paso === 2 && (<div className="space-y-3"><h2 className="font-bold text-brand-900">Paso 2 · Amenazas <span className="text-sm font-normal text-slate-400">({amSel.length})</span></h2>
          <div className="flex flex-wrap items-center gap-2"><div className="min-w-[220px] flex-1"><Search v={qAm} set={setQAm} ph="Buscar amenaza…" /></div>
            {[["", "Todas"], ...Object.entries(GRUPOS_AMENAZA)].map(([g, l]) => <button key={g} onClick={() => setGAm(g)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${gAm === g ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-500"}`}>{l}</button>)}</div>
          <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">{amFil.map((a) => (
            <label key={a.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm hover:bg-slate-50 ${asociada(a, activo) ? "bg-brand-50/40" : ""}`}>
              <input type="checkbox" checked={amSel.includes(a.id)} onChange={() => toggle(amSel, setAmSel, a.id)} className="h-4 w-4 accent-brand-600" />
              <b className="font-mono text-brand-700">{a.codigo}</b><span className="flex-1">{a.nombre}</span>
              {asociada(a, activo) && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">asociada</span>}
              <span className="text-xs text-slate-400">PERT {a.f_pert}{a.es_critica ? " ⚠" : ""}</span></label>))}</div></div>)}

        {/* 3 VULNERABILIDADES */}
        {paso === 3 && (<div className="space-y-3"><h2 className="font-bold text-brand-900">Paso 3 · Vulnerabilidades <span className="text-sm font-normal text-slate-400">({vuSel.length})</span></h2>
          <p className="text-xs text-slate-500">Las vulnerabilidades asociadas a las amenazas seleccionadas vienen preseleccionadas; puedes ajustar la selección.</p>
          <div className="flex flex-wrap items-center gap-2"><div className="min-w-[220px] flex-1"><Search v={qVu} set={setQVu} ph="Buscar vulnerabilidad…" /></div>
            {[["", "Todas"], ...Object.keys(GRUPOS_VULN).map((k) => [k, k])].map(([g, l]) => <button key={g} onClick={() => setGVu(g)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${gVu === g ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-500"}`}>{l || "Todas"}</button>)}
            <button onClick={() => setVuSel([...new Set([...vuSel, ...vuSugeridas])])} className="rounded-lg border border-brand-300 px-2.5 py-1.5 text-xs font-semibold text-brand-700">+ Sugeridas ({vuSugeridas.size})</button></div>
          <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">{vuFil.map((v) => (
            <label key={v.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm hover:bg-slate-50 ${vuSugeridas.has(v.id) ? "bg-brand-50/40" : ""}`}>
              <input type="checkbox" checked={vuSel.includes(v.id)} onChange={() => toggle(vuSel, setVuSel, v.id)} className="h-4 w-4 accent-brand-600" />
              <b className="font-mono text-brand-700">{v.codigo}</b><span className="flex-1">{v.nombre}</span>
              {vuSugeridas.has(v.id) && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">sugerida</span>}
              <span className="text-xs text-slate-400">Sev {v.severidad} · D {v.degradacion?.toFixed(1)}</span></label>))}</div></div>)}

        {/* 4 CONTROLES */}
        {paso === 4 && (<div className="space-y-3"><h2 className="font-bold text-brand-900">Paso 4 · Controles existentes <span className="text-sm font-normal text-slate-400">({ctSel.length})</span></h2>
          <p className="text-xs text-slate-500">Los controles que mitigan las vulnerabilidades seleccionadas vienen preseleccionados; puedes ajustar la selección.</p>
          <Search v={qCt} set={setQCt} ph="Buscar control…" />
          <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">{ctFil.map((c) => (
            <label key={c.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm hover:bg-slate-50 ${ctSugeridos.has(c.id) ? "bg-brand-50/40" : ""}`}>
              <input type="checkbox" checked={ctSel.includes(c.id)} onChange={() => toggle(ctSel, setCtSel, c.id)} className="h-4 w-4 accent-brand-600" />
              <b className="font-mono text-brand-700">{c.codigo}</b><span className="flex-1">{c.nombre}</span>
              {ctSugeridos.has(c.id) && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">asociado</span>}
              <span className="text-xs text-slate-400">{c.estado} · FRC {c.frc}</span></label>))}</div>
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">FRC efectivo = <b>{frcEfectivo}</b> {ctrlEfectivo ? `(mejor control: ${ctrlEfectivo.codigo})` : "(sin control → riesgo máximo)"}. Rige el control más efectivo seleccionado.</p></div>)}

        {/* 5 TEF editable */}
        {paso === 5 && (<div className="space-y-3"><h2 className="font-bold text-brand-900">Paso 5 · TEF por amenaza (editable)</h2>
          <p className="text-sm text-slate-500">Valores precargados del catálogo; ajústalos según tu criterio. F_PERT = (O + 4·MP + P)/6.</p>
          <div className="overflow-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-3 py-2">Amenaza</th><th className="px-3 py-2">O</th><th className="px-3 py-2">MP</th><th className="px-3 py-2">P</th><th className="px-3 py-2 text-center">F_PERT</th></tr></thead>
            <tbody>{amObjs.map((a) => { const t = tefMap[a.id] || {}; const fp = ((Number(t.o) + 4 * Number(t.mp) + Number(t.p)) / 6) || 0; return (
              <tr key={a.id} className="border-t border-slate-100"><td className="px-3 py-2"><b className="font-mono text-brand-700">{a.codigo}</b> {a.nombre}</td>
                {["o", "mp", "p"].map((k) => <td key={k} className="px-3 py-1.5"><input type="number" step="0.001" min="0" value={t[k] ?? ""} onChange={(e) => setTefVal(a.id, k, e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1 text-sm" /></td>)}
                <td className="px-3 py-2 text-center font-bold text-brand-900">{fp.toFixed(2)}</td></tr>); })}</tbody></table></div>
          <textarea rows={2} value={justif} onChange={(e) => setJustif(e.target.value)} placeholder="Justificación / fuente (obligatorio)…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <IAPanel titulo="Validar TEF con datos del sector" tipo="tef_contexto" payload={{ amenaza_nombre: amObjs.map((a) => a.nombre).join(", "), sector: "Salud privada", pais: "Ecuador" }} /></div>)}

        {/* 6 LM + FÓRMULA */}
        {paso === 6 && (() => {
          const am0 = amObjs[0]; const t0 = tefMap[am0?.id] || {};
          const fp0 = Math.round((((Number(t0.o) + 4 * Number(t0.mp) + Number(t0.p)) / 6) || 0) * 100) / 100;
          const lmMean = (n) => { const l = lmDe(n); return Math.round((l.min + 4 * l.esp + l.max) / 6); };
          const lmC = lmMean(activo?.dim_confidencialidad), lmI = lmMean(activo?.dim_integridad), lmD = lmMean(activo?.dim_disponibilidad);
          const aleDet = Math.round(fp0 * (lmC + lmI + lmD) * frcEfectivo);
          return (<div className="space-y-4"><h2 className="font-bold text-brand-900">Paso 6 · Magnitud de pérdida (LM)</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="mb-2 font-semibold text-slate-700">Estos datos vienen de la <b>valoración del activo {activo?.codigo}</b> (Fase 2). El nivel de impacto C/I/D selecciona el triple LM (§4.2.1):</p>
              <table className="w-full text-left text-xs"><thead className="text-slate-400"><tr><th className="py-1">Dimensión</th><th>Nivel</th><th className="text-right">LM_min</th><th className="text-right">LM_esp</th><th className="text-right">LM_max</th></tr></thead>
                <tbody>{[["C", activo?.dim_confidencialidad], ["I", activo?.dim_integridad], ["D", activo?.dim_disponibilidad]].map(([d, n]) => { const lm = lmDe(n); return (
                  <tr key={d} className="border-t border-slate-100"><td className="py-1.5 font-bold">{d}</td><td>{n}</td><td className="text-right">{formatUSD(lm.min)}</td><td className="text-right font-semibold">{formatUSD(lm.esp)}</td><td className="text-right">{formatUSD(lm.max)}</td></tr>); })}</tbody></table>
            </div>

            {/* Apartado fórmula interactiva */}
            <WizardFormula
              titulo="Simulación Monte Carlo · 10.000 iteraciones"
              formula="ALE_j = TEF_j × (LM_C + LM_I + LM_D) × FRC"
              sustitucion={`ALE ≈ ${fp0} × (${formatUSD(lmC)} + ${formatUSD(lmI)} + ${formatUSD(lmD)}) × ${frcEfectivo} = ${formatUSD(aleDet)}`}
              params={[
                { sim: "TEF_j", val: `${fp0}/año`, sig: "Frecuencia anual (Beta-PERT)", fuente: `F_PERT de la amenaza ${am0?.codigo}, definido por ti en el Paso 5.` },
                { sim: "LM_C/I/D", sig: "Pérdida USD por dimensión", fuente: `Media Beta-PERT (min+4·esp+max)/6 de la tabla §4.2.1, según el impacto C${activo?.dim_confidencialidad}/I${activo?.dim_integridad}/D${activo?.dim_disponibilidad} de la valoración del activo ${activo?.codigo}.` },
                { sim: "FRC", val: frcEfectivo, sig: "Factor de reducción del control", fuente: "Del mejor control existente seleccionado en el Paso 4." },
                { sim: "ALE", sig: "Pérdida Anual Esperada", fuente: "Media de las 10.000 pérdidas simuladas." },
                { sim: "P90 / P95", sig: "Percentiles de cola", fuente: "Escenarios adversos (90% y 95%) sobre la distribución simulada." },
              ]} />

            <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
              Se generarán <b>{amObjs.length}</b> amenazas × <b>{vuObjs.length}</b> vulnerab. = <b>{amObjs.length * vuObjs.length}</b> escenarios. Cada amenaza usa su propio TEF (Paso 5); FRC = {frcEfectivo}.
              <span className="mt-1 block text-xs text-slate-500">Este valor estima la <b>media</b> de la simulación Monte Carlo (suma de C+I+D × FRC). El <b>ALE_PERT</b> determinista del Paso 7 es una métrica distinta: usa solo la dimensión de mayor impacto y sin FRC, por eso es menor.</span>
            </div></div>);
        })()}

        {/* 7 CÁLCULO */}
        {paso === 7 && (<div className="space-y-4"><h2 className="font-bold text-brand-900">Paso 7 · Resultados ({calcs.length})</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-[11px] text-slate-400">ALE_PERT total</p><p className="text-lg font-black text-brand-900">{formatUSD(aleTotal)}</p></div>
            <div className="rounded-xl bg-red-50 p-3 text-center"><p className="text-[11px] text-slate-400">Críticos</p><p className="text-lg font-black text-red-700">{calcs.filter((c) => c.nivel === "critico").length}</p></div>
            <div className="rounded-xl bg-orange-50 p-3 text-center"><p className="text-[11px] text-slate-400">Altos</p><p className="text-lg font-black text-orange-700">{calcs.filter((c) => c.nivel === "alto").length}</p></div></div>
          {calcs[0] && (() => {
            const c0 = calcs[0]; const lmEsp = lmDe(c0.impacto_max).esp;
            return (<div className="space-y-2">
              <p className="text-sm font-semibold text-slate-600">Fórmulas deterministas aplicadas <span className="text-slate-400">(ejemplo: {c0._am.codigo}×{c0._vu.codigo} · cada escenario usa sus propios valores)</span></p>
              <div className="grid gap-4 lg:grid-cols-2">
                <WizardFormula titulo="Riesgo Intrínseco" formula="RI = VA × P × D" sustitucion={`RI = ${c0.va} × ${c0.p_nivel} × ${c0.d} = ${c0.ri}`}
                  params={[{ sim: "VA", val: c0.va, sig: "Valor del Activo", fuente: "Valoración del activo (Fase 2), escala 1–5." },
                    { sim: "P", val: c0.p_nivel, sig: "Probabilidad", fuente: "Nivel 1–5 derivado del TEF_PERT (Paso 5)." },
                    { sim: "D", val: c0.d, sig: "Degradación", fuente: "Severidad de la vulnerabilidad seleccionada (Paso 3)." }]} />
                <WizardFormula titulo="Riesgo Residual" formula="RR = RI × FRC" sustitucion={`RR = ${c0.ri} × ${c0.frc} = ${c0.rr}`}
                  params={[{ sim: "RI", val: c0.ri, sig: "Riesgo Intrínseco", fuente: "Resultado de VA × P × D." },
                    { sim: "FRC", val: c0.frc, sig: "Factor de reducción", fuente: "Del control existente (Paso 4): 1.0/0.6/0.3." }]} />
                <WizardFormula titulo="RR simplificado (mapa)" formula="RR_simple = P × I" sustitucion={`RR_simple = ${c0.p_nivel} × ${c0.impacto_max} = ${c0.rr_simple}`}
                  params={[{ sim: "P", val: c0.p_nivel, sig: "Probabilidad", fuente: "Nivel 1–5 del TEF_PERT." },
                    { sim: "I", val: c0.impacto_max, sig: "Impacto", fuente: "máx(C,I,D) de la valoración del activo." }]} />
                <WizardFormula titulo="ALE determinística" formula="ALE_PERT = TEF_PERT × LM_esp" sustitucion={`ALE_PERT = ${c0.tef_pert_efectivo} × ${formatUSD(lmEsp)} = ${formatUSD(c0.ale_pert_usd)}`}
                  params={[{ sim: "TEF_PERT", val: `${c0.tef_pert_efectivo}/año`, sig: "Frecuencia anual", fuente: "(O+4·MP+P)/6 con tus valores del Paso 5." },
                    { sim: "LM_esp", val: formatUSD(lmEsp), sig: "Pérdida esperada", fuente: `Tabla §4.2.1 para impacto I=${c0.impacto_max} del activo.` }]} />
              </div>
            </div>);
          })()}
          <div className="max-h-64 overflow-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-3 py-2">Escenario</th><th className="px-3 py-2 text-center">RR</th><th className="px-3 py-2 text-center">Nivel</th><th className="px-3 py-2 text-right">ALE_PERT</th><th className="px-3 py-2 text-right">P90</th></tr></thead>
            <tbody>{calcs.map((c) => <tr key={c.id} className="border-t border-slate-100"><td className="px-3 py-2"><b className="font-mono text-brand-700">{c._am.codigo}×{c._vu.codigo}</b></td><td className="px-3 py-2 text-center font-bold">{c.rr_simple}</td><td className="px-3 py-2 text-center"><Nivel n={c.nivel} /></td><td className="px-3 py-2 text-right">{formatUSD(c.ale_pert_usd)}</td><td className="px-3 py-2 text-right text-slate-500">{formatUSD(c.ale_p90_usd)}</td></tr>)}</tbody></table></div>
          {calcs.length > 0 && (() => {
            const esc = calcs[Math.min(escIdx, calcs.length - 1)];
            const etiqueta = `${esc._am.codigo}×${esc._vu.codigo}`;
            return (<div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-600">Gráficas por escenario</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEscIdx((i) => (i - 1 + calcs.length) % calcs.length)} disabled={calcs.length < 2}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40" title="Escenario anterior">←</button>
                  <span className="min-w-[150px] text-center text-sm"><b className="font-mono text-brand-700">{etiqueta}</b> <span className="text-slate-400">({escIdx + 1} de {calcs.length})</span></span>
                  <button onClick={() => setEscIdx((i) => (i + 1) % calcs.length)} disabled={calcs.length < 2}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40" title="Escenario siguiente">→</button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3"><p className="mb-2 text-sm font-semibold text-slate-600">Distribución ALE ({etiqueta})</p>
                  <ResponsiveContainer width="100%" height={200}><BarChart data={histo}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="x" tickFormatter={formatUSD} fontSize={10} stroke="#94a3b8" /><YAxis fontSize={10} stroke="#94a3b8" /><Tooltip formatter={(v) => [`${v} iter`, "Frec."]} labelFormatter={(l) => formatUSD(l)} /><Bar dataKey="count" fill="#b62525" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
                <div className="rounded-xl border border-slate-200 p-3"><p className="mb-2 text-sm font-semibold text-slate-600">Mapa de calor ({etiqueta})</p><MiniHeat p={esc.p_nivel} i={esc.impacto_max} /></div>
              </div>
            </div>);
          })()}</div>)}

        {/* 8 PRIORIZACIÓN */}
        {paso === 8 && (() => {
          const COL = { critico: "#dc2626", alto: "#ea580c", medio: "#eab308", bajo: "#16a34a" };
          const orden = calcs.slice().sort((a, b) => b.rr_simple - a.rr_simple);
          const chart = orden.map((c) => ({ label: `${c._am.codigo}×${c._vu.codigo}`, ale: c.ale_p90_usd, rr: c.rr_simple, nivel: c.nivel }));
          return (<div className="space-y-4"><h2 className="font-bold text-brand-900">Paso 8 · Evaluación y priorización</h2>
            <p className="text-sm text-slate-500">Esta fase no genera nuevos cálculos. Los escenarios obtenidos en el Paso 7 se ordenan según su nivel de riesgo (RR = P × I) y se les asigna el plazo de tratamiento conforme a los umbrales de aceptación establecidos en la metodología, con el fin de determinar la prioridad de atención.</p>

            {/* Tabla de referencia: umbrales de aceptación */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2">Nivel</th><th className="px-3 py-2">Rango RR</th><th className="px-3 py-2">Decisión</th><th className="px-3 py-2">Plazo</th></tr></thead>
                <tbody>{CRITERIOS_ACEPTACION.map((c) => (
                  <tr key={c.nivel} className="border-t border-slate-100"><td className="px-3 py-1.5"><span className={`rounded-full border px-2 py-0.5 font-bold ${NIVEL_STYLES[c.color]}`}>{c.nivel}</span></td>
                    <td className="px-3 py-1.5 font-mono font-bold">{c.rango}</td><td className="px-3 py-1.5 text-slate-600">{c.decision}</td>
                    <td className="px-3 py-1.5">{c.nivel === "Crítico" ? "< 30 días" : c.nivel === "Alto" ? "< 90 días" : c.nivel === "Medio" ? "Semestral" : "Anual"}</td></tr>))}</tbody></table>
            </div>

            {/* Gráfica: ALE_P90 por escenario, coloreada por nivel */}
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-600">Exposición por escenario (ALE_P90, ordenado)</p>
              <ResponsiveContainer width="100%" height={Math.max(160, chart.length * 34)}>
                <BarChart data={chart} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis type="number" tickFormatter={formatUSD} fontSize={10} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="label" width={90} fontSize={10} stroke="#94a3b8" />
                  <Tooltip formatter={(v) => [formatUSD(v), "ALE_P90"]} /><Bar dataKey="ale" radius={[0, 4, 4, 0]}>{chart.map((d, i) => <Cell key={i} fill={COL[d.nivel]} />)}</Bar>
                </BarChart></ResponsiveContainer>
            </div>

            {/* Lista priorizada */}
            <div className="space-y-2">{orden.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span><b className="text-slate-400">#{i + 1}</b> <b className="font-mono text-brand-700">{c._am.codigo}×{c._vu.codigo}</b></span>
                <span className="flex items-center gap-3"><Nivel n={c.nivel} /> RR {c.rr_simple} · {formatUSD(c.ale_p90_usd)} P90 ·{c.nivel === "critico" ? " <30d" : c.nivel === "alto" ? " <90d" : c.nivel === "medio" ? " semestral" : " anual"}</span></div>))}</div></div>);
        })()}

        {/* 9 TRATAMIENTO */}
        {paso === 9 && (<div className="space-y-4"><h2 className="font-bold text-brand-900">Paso 9 · Tratamiento por escenario <span className="text-sm font-normal text-slate-400">({calcs.length})</span></h2>

          {/* Tabla informativa §8.1 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-brand-900">Estrategias de tratamiento aplicables (§8.1)</p>
            <p className="mb-3 mt-1 text-xs text-slate-500">{ESTRATEGIAS_INTRO}</p>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                  <tr><th className="px-2 py-1.5">Estrategia</th><th className="px-2 py-1.5">Definición operativa</th><th className="px-2 py-1.5">Cuándo aplica en Medisalud</th></tr>
                </thead>
                <tbody>
                  {ESTRATEGIAS_TRATAMIENTO.map((e) => {
                    const cls = {
                      MITIGAR: ["bg-red-50/60", "bg-red-100 text-red-800 border-red-300"],
                      TRANSFERIR: ["bg-yellow-50/60", "bg-yellow-100 text-yellow-800 border-yellow-300"],
                      ACEPTAR: ["bg-green-50/60", "bg-green-100 text-green-800 border-green-300"],
                      EVITAR: ["bg-orange-50/60", "bg-orange-100 text-orange-800 border-orange-300"],
                    }[e.estrategia] || ["", "bg-slate-100 text-slate-700 border-slate-300"];
                    return (
                      <tr key={e.estrategia} className={`border-t border-slate-100 align-top ${cls[0]}`}>
                        <td className="px-2 py-1.5"><span className={`rounded-full border px-2 py-0.5 font-bold ${cls[1]}`}>{e.estrategia}</span></td>
                        <td className="px-2 py-1.5 text-slate-600">{e.definicion}</td>
                        <td className="px-2 py-1.5 text-slate-600">{e.cuando}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <IAPanel titulo="Sugerencia de controles ISO 27002" tipo="sugerencia_tratamiento" payload={{ activo: activo?.codigo, va: calcs[0]?.va, amenaza: amObjs.map((a) => a.nombre).join(", "), vulnerabilidad: vuObjs.map((v) => v.nombre).join(", "), rr: Math.max(...calcs.map((c) => c.rr_simple)), nivel: calcs[0]?.nivel, ale_pert: aleTotal, ale_p90: Math.max(...calcs.map((c) => c.ale_p90_usd)), lopdp_aplica: activo?.procesa_datos_salud ? "Sí" : "No" }} />

          {/* Tratamiento individual por escenario */}
          {calcs.map((c) => { const t = tratDe(c.id); const critAlto = c.nivel === "critico" || c.nivel === "alto"; return (
            <div key={c.id} className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span><b className="font-mono text-brand-700">{c._am.codigo}×{c._vu.codigo}</b> <span className="text-xs text-slate-500">{c._am.nombre} × {c._vu.nombre}</span></span>
                <span className="flex items-center gap-2 text-xs text-slate-500"><Nivel n={c.nivel} /> RR {c.rr_simple} · ALE {formatUSD(c.ale_pert_usd)}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">{[["mitigar", "Mitigar"], ["transferir", "Transferir"], ["aceptar", "Aceptar"], ["evitar", "Evitar"]].map(([v, l]) => { const block = critAlto && (v === "aceptar" || v === "evitar"); return (
                <button key={v} disabled={block} title={block ? "No permitido para CRÍTICO/ALTO" : ""} onClick={() => setTratEsc(c.id, { estrategia: v })} className={`rounded-xl border-2 p-2.5 text-sm font-bold ${t.estrategia === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"} ${block ? "cursor-not-allowed opacity-40" : ""}`}>{l}</button>); })}</div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Controles propuestos ({t.controles.length})</p>
                <div className="grid gap-1.5 sm:grid-cols-2">{controles.map((ct) => (
                  <label key={ct.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                    <input type="checkbox" checked={t.controles.includes(ct.id)} className="h-3.5 w-3.5 accent-brand-600" onChange={(e) => setTratEsc(c.id, { controles: e.target.checked ? [...t.controles, ct.id] : t.controles.filter((x) => x !== ct.id) })} />
                    <b className="font-mono text-brand-700">{ct.codigo}</b> <span className="truncate">{ct.nombre}</span></label>))}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={t.costo} onChange={(e) => setTratEsc(c.id, { costo: e.target.value })} type="number" placeholder="Costo USD/año" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input value={t.decision} onChange={(e) => setTratEsc(c.id, { decision: e.target.value })} placeholder="Decisión y justificación" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>); })}

          <input value={aprobado} onChange={(e) => setAprobado(e.target.value)} placeholder="Aprobado por (aplica a todos los escenarios)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          {!tratCompleto && <p className="text-xs text-orange-600">Selecciona una estrategia para cada escenario antes de guardar.</p>}</div>)}

        {/* 10 RESUMEN */}
        {paso === 10 && (<div className="space-y-4 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600"><Icon name="check" className="h-9 w-9" /></div>
          <h2 className="text-xl font-black text-brand-900">{calcs.length} escenarios guardados</h2>
          <p className="text-sm text-slate-500">{activo?.codigo} · {amObjs.length} amenazas × {vuObjs.length} vulnerab. · ALE_PERT total {formatUSD(aleTotal)} · estrategias: {Object.entries(calcs.reduce((acc, c) => { const e = tratDe(c.id).estrategia || "—"; acc[e] = (acc[e] || 0) + 1; return acc; }, {})).map(([e, n]) => `${e} (${n})`).join(" · ") || "—"}</p>
          <div className="flex justify-center gap-3"><button onClick={() => navigate("/riesgos")} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Ir a Riesgos</button>
            <button onClick={() => window.location.reload()} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600">Crear otro</button></div></div>)}

        {/* NAV */}
        {paso < 10 && (<div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
          <button onClick={() => setPaso((p) => Math.max(1, p - 1))} disabled={paso === 1} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40">← Atrás</button>
          {paso === 6 ? (<button onClick={calcular} disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? `Calculando ${amSel.length * vuSel.length}…` : "Calcular →"}</button>)
            : paso === 9 ? (<button onClick={guardarTrat} disabled={!tratCompleto || busy} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Guardando…" : "Guardar →"}</button>)
            : (<button onClick={cont} disabled={puede[paso] === false} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Continuar →</button>)}</div>)}
      </div>
    </div>
  );
}
