import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "./Icon";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/organizacion", label: "Organización", icon: "building" },
  { to: "/contexto", label: "Contexto", icon: "context", badge: "BASE" },
  { to: "/activos", label: "Activos", icon: "assets" },
  { to: "/amenazas", label: "Amenazas", icon: "threats" },
  { to: "/vulnerabilidades", label: "Vulnerabilidades", icon: "bolt" },
  { to: "/controles", label: "Controles", icon: "lock" },
  { to: "/escenarios/nuevo", label: "Nuevo escenario", icon: "spark" },
  { to: "/riesgos", label: "Riesgos", icon: "calc" },
  { to: "/tratamiento", label: "Tratamiento", icon: "treat" },
  { to: "/monitoreo", label: "Monitoreo", icon: "monitor" },
  { to: "/kpis", label: "KPIs", icon: "chart" },
  { to: "/informe", label: "Informe ejecutivo", icon: "doc" },
  { to: "/configuracion-ia", label: "Configuración IA", icon: "ai" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // móvil
  const [collapsed, setCollapsed] = useState(false); // escritorio

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar rojo */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-brand-600 via-brand-700 to-brand-900 text-white shadow-2xl transition-all duration-300
          ${collapsed ? "lg:w-20" : "lg:w-64"} w-64
          ${open ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/25 text-white">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="whitespace-nowrap text-sm font-extrabold">GRM Medisalud</p>
              <p className="whitespace-nowrap text-[10px] text-red-200">ISO 27005 · MAGERIT</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-white text-brand-700 shadow-md font-semibold"
                    : "text-red-50 hover:bg-white/15"
                }`
              }
            >
              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="flex flex-1 items-center justify-between gap-2 whitespace-nowrap">
                  {item.label}
                  {item.badge && (
                    <span className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-brand-700">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Toggle colapsar (escritorio) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden items-center justify-center gap-2 border-t border-white/10 py-3 text-xs font-semibold text-red-100 transition hover:bg-white/10 lg:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!collapsed && "Colapsar menú"}
        </button>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburguesa: abre en móvil, colapsa en escritorio */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setOpen((o) => !o);
                else setCollapsed((c) => !c);
              }}
              className="rounded-lg p-2 text-brand-700 transition hover:bg-brand-50"
              title="Menú"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-brand-700">
              ← Sitio público
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-brand-900">{user?.email}</p>
              <p className="text-[11px] capitalize text-slate-400">{user?.rol}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon name="logout" className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
