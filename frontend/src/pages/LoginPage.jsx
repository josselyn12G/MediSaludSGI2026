import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@medisalud.com");
  const [password, setPassword] = useState("medisalud2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "Credenciales inválidas. Verifica tu email y contraseña."
          : "No se pudo conectar con el servidor. Verifica que el backend esté corriendo (docker compose up o manage.py runserver)."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-4xl font-black leading-tight">Gestión de Riesgos Cibernéticos para el sector salud</h2>
          <p className="mt-4 max-w-md text-white/85">
            ISO/IEC 27005 · MAGERIT v3.0 · FAIR · PERT. Cuantifica el riesgo y protege los datos de tus pacientes.
          </p>
        </div>
        <div className="relative flex items-center gap-6 text-sm text-white/80">
          <span className="flex items-center gap-2"><Icon name="lock" className="h-4 w-4" /> Cifrado & LOPDP</span>
          <span className="flex items-center gap-2"><Icon name="ai" className="h-4 w-4" /> Monte Carlo</span>
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
            <h1 className="text-2xl font-black text-neutral-900">Bienvenido de nuevo</h1>
            <p className="mt-1 text-sm text-neutral-500">Ingresa al sistema de gestión de riesgos</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="tu@medisalud.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Ingresando…" : "Ingresar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="font-semibold text-brand-600 hover:underline">
                Regístrate
              </Link>
            </p>

            <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-3 text-center text-xs text-brand-700">
              Demo: <b>admin@medisalud.com</b> / <b>medisalud2026</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
