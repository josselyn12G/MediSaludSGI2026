import { useState } from "react";
import { clearIaKey, consultarIA, getIaKey, setIaKey } from "../api/resources";
import Icon from "../components/Icon";

export default function ConfiguracionIAPage() {
  const [key, setKey] = useState(getIaKey());
  const [guardada, setGuardada] = useState(!!getIaKey());
  const [estado, setEstado] = useState(null); // {ok, msg}
  const [probando, setProbando] = useState(false);

  const guardar = () => {
    setIaKey(key.trim());
    setGuardada(!!key.trim());
    setEstado({ ok: true, msg: "API key guardada en este navegador (sessionStorage)." });
  };

  const borrar = () => {
    clearIaKey();
    setKey("");
    setGuardada(false);
    setEstado({ ok: true, msg: "API key eliminada de este navegador." });
  };

  const probar = async () => {
    setProbando(true);
    setEstado(null);
    try {
      await consultarIA("tef_contexto", { amenaza: "Ransomware", sector: "Salud privada", pais: "Ecuador" });
      setEstado({ ok: true, msg: "✓ Conexión exitosa con OpenAI. La key funciona." });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Error desconocido.";
      setEstado({ ok: false, msg: `✗ ${msg}` });
    } finally {
      setProbando(false);
    }
  };

  const masked = guardada && getIaKey()
    ? `${getIaKey().slice(0, 6)}••••••••${getIaKey().slice(-4)}`
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <Icon name="ai" className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-brand-900">Configuración del Asistente IA</h1>
          <p className="text-slate-500">Conecta tu cuenta de ChatGPT (OpenAI) para la asistencia del análisis.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-1 block text-sm font-semibold text-slate-700">API key de OpenAI</label>
        <p className="mb-3 text-xs text-slate-400">
          Obténla en <span className="font-mono">platform.openai.com/api-keys</span>. Empieza con <span className="font-mono">sk-</span>.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <button onClick={guardar} disabled={!key.trim()}
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50">
            Guardar
          </button>
        </div>

        {masked && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <span>Key activa: <span className="font-mono">{masked}</span></span>
            <button onClick={borrar} className="font-semibold text-red-600 hover:underline">Eliminar</button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button onClick={probar} disabled={!guardada || probando}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Icon name="spark" className={`h-4 w-4 ${probando ? "animate-spin" : ""}`} />
            {probando ? "Probando…" : "Probar conexión"}
          </button>
          {estado && (
            <span className={`text-sm font-medium ${estado.ok ? "text-green-600" : "text-red-600"}`}>{estado.msg}</span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5 text-sm text-slate-600">
        <p className="mb-2 flex items-center gap-2 font-bold text-brand-800">
          <Icon name="lock" className="h-4 w-4" /> Seguridad de tu key
        </p>
        <ul className="space-y-1.5">
          <li className="flex gap-2"><span className="text-brand-500">▸</span> Se guarda <b>solo en este navegador</b> (sessionStorage). Nunca se almacena en la base de datos.</li>
          <li className="flex gap-2"><span className="text-brand-500">▸</span> Se borra automáticamente al cerrar la pestaña.</li>
          <li className="flex gap-2"><span className="text-brand-500">▸</span> El frontend nunca llama a OpenAI directo: la petición pasa por el proxy seguro de Medisalud (<span className="font-mono">/api/ia/consultar/</span>) que añade tu key solo para esa llamada.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <p className="mb-2 font-bold text-brand-800">¿Dónde se usa?</p>
        <p>Una vez guardada, el asistente IA se usa en el wizard de escenarios (Paso 4 · estimación de TEF y Paso 7 · sugerencia de controles ISO 27002) y en el generador de informe ejecutivo. Botones con el ícono 🤖.</p>
      </div>
    </div>
  );
}
