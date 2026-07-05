import { useEffect, useState } from "react";

export default function Modal({ open, onClose, title, children, wide, expandable }) {
  const [max, setMax] = useState(false);

  useEffect(() => {
    if (!open) setMax(false);
  }, [open]);

  if (!open) return null;

  const sizeCls = max
    ? "w-[96vw] max-w-[96vw] min-h-[92vh]"
    : wide
    ? "max-w-3xl w-full"
    : "max-w-xl w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/70 p-4 backdrop-blur-sm">
      <div className={`my-6 ${sizeCls} animate-fadeUp rounded-2xl bg-white shadow-2xl transition-all`}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h3 className="text-lg font-bold text-brand-900">{title}</h3>
          <div className="flex items-center gap-1">
            {expandable && (
              <button
                onClick={() => setMax((m) => !m)}
                title={max ? "Restaurar ventana" : "Ampliar ventana"}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
              >
                {max ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path d="M9 9H4V4M15 9h5V4M9 15H4v5M15 15h5v5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
        <div className={`px-6 py-5 ${max ? "max-h-[80vh] overflow-y-auto" : ""}`}>{children}</div>
      </div>
    </div>
  );
}
