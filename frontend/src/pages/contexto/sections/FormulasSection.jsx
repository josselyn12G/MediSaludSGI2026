import { useMemo, useState } from "react";
import ParametroFijo from "../components/ParametroFijo";
import Callout from "../components/Callout";

function FormulaCard({ data }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-500">{data.nombre}</p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 px-3 py-2.5 font-mono text-sm font-semibold text-cyan-300">{data.expresion}</pre>
      <p className="mt-3 text-sm text-slate-600">{data.descripcion}</p>
      {data.variables && (
        <ul className="mt-3 space-y-1 text-xs">
          {Object.entries(data.variables).map(([k, v]) => (
            <li key={k} className="flex gap-2">
              <span className="font-mono font-bold text-brand-700">{k}</span>
              <span className="text-slate-500">{v}</span>
            </li>
          ))}
        </ul>
      )}
      {(data.rango_resultado || data.uso || data.uso_mc) && (
        <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
          {data.rango_resultado && <p>Resultado: {data.rango_resultado}</p>}
          {data.uso && <p>{data.uso}</p>}
          {data.uso_mc && <p>Uso MC: {data.uso_mc}</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, set }) {
  const onChange = (e) => {
    const v = e.target.value.replace(",", ".");
    if (v === "" || /^\d*\.?\d*$/.test(v)) set(v);
  };
  return (
    <label className="flex-1">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <input type="text" inputMode="decimal" value={value} onChange={onChange}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
    </label>
  );
}

function CalculadoraPert() {
  const [o, setO] = useState("1");
  const [mp, setMp] = useState("3");
  const [p, setP] = useState("8");
  const [modo, setModo] = useState("tef"); // "tef" | "lm"
  const [tefExtra, setTefExtra] = useState("1");

  const ePert = useMemo(() => (Number(o) + 4 * Number(mp) + Number(p)) / 6, [o, mp, p]);
  const ale = useMemo(() => ePert * Number(tefExtra), [ePert, tefExtra]);

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 shadow-sm">
      <p className="font-bold text-brand-900">Calculadora PERT — explorar valores</p>
      <p className="mb-4 text-xs text-slate-500">
        Única parte interactiva del módulo. No modifica parámetros del sistema; solo permite experimentar con la fórmula
        <span className="font-mono"> E_PERT = (O + 4×MP + P) / 6</span>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Field label="Optimista (O)" value={o} set={setO} />
        <Field label="Más Probable (MP)" value={mp} set={setMp} />
        <Field label="Pesimista (P)" value={p} set={setP} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[["tef", "Usar como TEF (/año)"], ["lm", "Usar como LM (USD)"]].map(([m, l]) => (
          <button key={m} onClick={() => setModo(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${modo === m ? "bg-brand-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-white"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 text-center shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">Resultado E_PERT</p>
        <p className="text-2xl font-black text-brand-700">
          {modo === "lm" ? `$${ePert.toLocaleString("es-EC", { maximumFractionDigits: 0 })}` : `${ePert.toFixed(3)} /año`}
        </p>
      </div>

      {modo === "lm" && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="TEF_PERT adicional (/año)" value={tefExtra} set={setTefExtra} />
          <div className="flex-1 rounded-xl bg-neutral-900 p-3 text-center text-white">
            <p className="text-[11px] text-neutral-400">ALE = TEF_PERT × LM_PERT</p>
            <p className="text-lg font-black text-brand-300">${ale.toLocaleString("es-EC", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormulasSection({ formulas = {} }) {
  return (
    <section id="formulas" className="space-y-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-brand-900">Fórmulas centrales del modelo</h2>
          <p className="text-sm text-slate-500">El motor de cálculo de las Fases 3, 4 y 5 (§6.2).</p>
        </div>
        <ParametroFijo />
      </div>

      {/* Bloque 1: 4 cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormulaCard data={formulas.ri} />
        <FormulaCard data={formulas.rr} />
        <FormulaCard data={formulas.ale_pert} />
        <FormulaCard data={formulas.tef_pert} />
      </div>

      {/* Bloque 2: degradación */}
      {formulas.degradacion?.tabla && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-brand-800">Valores del coeficiente D según severidad de la vulnerabilidad</h3>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-4 py-2.5">Severidad</th><th className="px-4 py-2.5 text-center">D</th><th className="px-4 py-2.5">Interpretación</th></tr>
              </thead>
              <tbody>
                {formulas.degradacion.tabla.map((d) => (
                  <tr key={d.severidad} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{d.severidad}</td>
                    <td className="px-4 py-2.5 text-center font-black text-brand-700">{d.d.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{d.interpretacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bloque 3: calculadora */}
      <CalculadoraPert />

      <Callout tono="info" titulo="Dónde se usa esto →">
        Todos los módulos de Fase 3, 4 y 5.
      </Callout>
    </section>
  );
}
