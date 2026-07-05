import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganizaciones } from "../api/resources";
import { FASES } from "../data/metodologia";
import useReveal from "../components/useReveal";
import AnimatedCounter from "../components/AnimatedCounter";
import Icon from "../components/Icon";

const SOLUCIONES = [
  { t: "ISO/IEC 27005", d: "Proceso de gestión de riesgos de seguridad de la información, fase por fase y auditable." },
  { t: "MAGERIT v3.0", d: "Valoración multidimensional de activos con catálogo de amenazas y vulnerabilidades." },
  { t: "FAIR", d: "Cuantificación financiera del riesgo: frecuencia de eventos y magnitud de pérdida en USD." },
  { t: "PERT + Monte Carlo", d: "Simulación de pérdidas anuales con percentiles P90/P95 para decisiones de inversión." },
  { t: "LOPDP Ecuador", d: "Cumplimiento de datos personales especiales (salud) y notificación a la SPDP." },
];

export default function LandingPage() {
  useReveal();
  const { data: orgs } = useQuery({ queryKey: ["orgs-public"], queryFn: fetchOrganizaciones });
  const org = orgs?.[0];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Icon name="shield" className="h-6 w-6 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold tracking-tight text-neutral-900">GRM · Medisalud</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-600">Ciberseguridad en Salud</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <a href="#servicios" className="transition hover:text-brand-600">Servicios</a>
            <a href="#soluciones" className="transition hover:text-brand-600">Soluciones</a>
            <a href="#impacto" className="transition hover:text-brand-600">Impacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:text-brand-600">
              Ingresar
            </Link>
            <Link to="/registro" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        {/* HERO rojo curvo */}
        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-8 py-20 text-white shadow-2xl shadow-brand-600/30 sm:px-14">
          {/* Curvas decorativas */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" fill="none">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M${-100 + i * 40} 420 Q 300 ${120 - i * 30} 760 ${360 - i * 20}`} stroke="white" strokeWidth="1.2" />
            ))}
            <circle cx="560" cy="60" r="220" stroke="white" strokeWidth="1" opacity="0.4" />
            <circle cx="560" cy="60" r="300" stroke="white" strokeWidth="1" opacity="0.25" />
          </svg>

          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-1.5 text-xs font-semibold text-white">
              <Icon name="bolt" className="h-3.5 w-3.5" /> ISO/IEC 27005:2022 · MAGERIT v3.0 · FAIR · PERT
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Gestión de Riesgos Cibernéticos para el sector salud
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              Plataforma cuantitativa que transforma la incertidumbre en decisiones financieras verificables:
              valoración de activos, simulación Monte Carlo y cumplimiento LOPDP en una sola interfaz.
            </p>
            <Link
              to="/login"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 font-semibold text-white shadow-xl transition hover:gap-4 hover:bg-black"
            >
              Conoce lo que podemos hacer juntos
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-neutral-900">
                <Icon name="bolt" className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* PRODUCTOS Y SERVICIOS */}
        <section id="servicios" className="py-20">
          <div className="reveal max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Productos & Servicios</span>
            <h2 className="mt-2 text-3xl font-black text-neutral-900">
              Las seis fases del ciclo ISO/IEC 27005 que digitaliza la plataforma
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FASES.map((f, i) => (
              <div
                key={f.n}
                className="reveal group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={f.icon} className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-black text-neutral-100">{String(f.n).padStart(2, "0")}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{f.nombre}</h3>
                <p className="mt-2 text-sm text-neutral-500">{f.desc}</p>
                <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2">
                  Ver más <Icon name="bolt" className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* NUESTRAS SOLUCIONES */}
        <section id="soluciones" className="border-t border-neutral-100 py-20">
          <div className="reveal">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">Nuestras Soluciones</span>
            <h2 className="mt-2 text-3xl font-black text-neutral-900">para tu negocio</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Marco metodológico como lista */}
            <div className="reveal space-y-3">
              {SOLUCIONES.map((s) => (
                <div key={s.t} className="flex gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 transition hover:border-brand-200 hover:bg-white hover:shadow-md">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
                    <Icon name="check" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{s.t}</p>
                    <p className="text-sm text-neutral-500">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tarjeta perfil de riesgo */}
            <div className="reveal flex flex-col justify-center rounded-3xl bg-neutral-900 p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600">
                    <Icon name="shield" className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Perfil de Riesgo</p>
                    <p className="text-xs text-neutral-400">{org?.nombre || "Medisalud Integral S.A."}</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-600/30 px-3 py-1 text-xs font-bold text-brand-200">CRÍTICO</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { l: "ALE total portafolio", v: "$4.11M" },
                  { l: "Riesgos críticos abiertos", v: "3" },
                  { l: "Cobertura MFA objetivo", v: "100%" },
                ].map((row) => (
                  <div key={row.l} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <span className="text-sm text-neutral-300">{row.l}</span>
                    <span className="font-bold text-brand-300">{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex h-24 items-end gap-1.5 rounded-xl bg-white/5 p-3">
                {[40, 65, 50, 80, 95, 70, 88, 60, 75, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-700 to-brand-400" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* WHY CHOOSE — bloque negro con estadísticas */}
      <section id="impacto" className="bg-neutral-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="reveal">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-500">Por qué elegir GRM</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Para proteger lo que más importa: los datos de tus pacientes
            </h2>
            <Link to="/registro" className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-brand-500 hover:bg-brand-600">
              Comenzar ahora
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600">
                <Icon name="bolt" className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
            {[
              { v: org?.num_pacientes_registrados ?? 18500, s: "+", l: "Pacientes protegidos" },
              { v: 33, s: "+", l: "Activos evaluados" },
              { v: 8, s: "", l: "Escenarios de riesgo" },
              { v: 10, s: "", l: "KPIs monitoreados" },
            ].map((stat) => (
              <div key={stat.l} className="reveal bg-neutral-950 p-6 text-center">
                <p className="text-3xl font-black text-brand-500 sm:text-4xl">
                  <AnimatedCounter value={Number(stat.v)} suffix={stat.s} />
                </p>
                <p className="mt-2 text-xs text-neutral-400">{stat.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-2 text-neutral-600">
            <Icon name="shield" className="h-5 w-5 text-brand-600" />
            <span className="text-sm font-semibold">GRM Medisalud Integral S.A. · v2.0 · 2026</span>
          </div>
          <p className="text-xs text-neutral-400">
            Proyecto académico — Seguridad Informática UDLA 2026 · ISO/IEC 27005 · MAGERIT v3.0 · FAIR · LOPDP Ecuador
          </p>
        </div>
      </footer>
    </div>
  );
}
