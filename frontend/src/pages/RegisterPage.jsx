import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    rol: "analista",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.email?.[0] ||
          data?.password?.[0] ||
          (err?.response
            ? "No se pudo crear la cuenta. Revisa los datos."
            : "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.")
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel rojo de marca */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" fill="none">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M${-100 + i * 50} 820 Q 300 ${300 - i * 40} 760 ${700 - i * 30}`} stroke="white" strokeWidth="1.2" />
          ))}
          <circle cx="520" cy="120" r="240" stroke="white" strokeWidth="1" opacity="0.4" />
        </svg>
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-black/25">
            <Icon name="shield" className="h-6 w-6 text-white" />
          </div>
          <span className="text-lg font-extrabold">GRM · Medisalud</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-black leading-tight">Únete a la plataforma de gestión de riesgos</h2>
          <p className="mt-4 max-w-md text-white/85">
            Valora activos, simula pérdidas con Monte Carlo y cumple la LOPDP del sector salud ecuatoriano.
          </p>
        </div>
        <div className="relative flex items-center gap-6 text-sm text-white/80">
          <span className="flex items-center gap-2"><Icon name="lock" className="h-4 w-4" /> Cifrado & LOPDP</span>
          <span className="flex items-center gap-2"><Icon name="heart" className="h-4 w-4" /> Datos clínicos</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-neutral-50 px-4 py-12">
        <div className="w-full max-w-md animate-fadeUp">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600">
              <Icon name="shield" className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-extrabold text-neutral-900">GRM · Medisalud</span>
          </Link>

          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/60">
            <h1 className="text-2xl font-black text-neutral-900">Crea tu cuenta</h1>
            <p className="mt-1 text-sm text-neutral-500">Únete a la plataforma de gestión de riesgos</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.first_name} onChange={set("first_name")} placeholder="Nombre" className={inputCls} />
                <input value={form.last_name} onChange={set("last_name")} placeholder="Apellido" className={inputCls} />
              </div>
              <input type="email" value={form.email} onChange={set("email")} required placeholder="Correo electrónico" className={inputCls} />
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
                placeholder="Contraseña (mín. 6 caracteres)"
                className={inputCls}
              />
              <select value={form.rol} onChange={set("rol")} className={inputCls}>
                <option value="analista">Analista de Riesgos</option>
                <option value="auditor">Auditor</option>
                <option value="viewer">Solo lectura</option>
                <option value="admin">Administrador</option>
              </select>

              {error && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Creando cuenta…" : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
