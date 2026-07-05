// Badge que confirma que la sección muestra parámetros NO editables.
// (Se usa la paleta roja/neutra del sistema — sin azul.)
export default function ParametroFijo({ texto = "Parámetro fijo · Medisalud Integral S.A." }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </svg>
      {texto}
    </span>
  );
}
