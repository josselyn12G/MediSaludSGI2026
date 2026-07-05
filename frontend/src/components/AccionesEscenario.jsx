import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEscenarioRiesgo } from "../api/resources";
import { exportarInformeEscenario } from "../utils/informeEscenario";

// Acciones de fila: ver · editar · exportar informe (IA) · eliminar.
export default function AccionesEscenario({ e, onVer, onEditar }) {
  const qc = useQueryClient();
  const [exp, setExp] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteEscenarioRiesgo(e.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["escenarios-riesgo"] }); qc.invalidateQueries({ queryKey: ["escenario-riesgo-stats"] }); },
  });
  const exportar = async () => {
    setExp(true);
    try { await exportarInformeEscenario(e); }
    catch (err) { alert(err?.response?.data?.error || "Configura tu API key en Configuración IA."); }
    finally { setExp(false); }
  };
  const btn = "rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600";
  return (
    <div className="flex justify-end gap-1">
      <button onClick={onVer} title="Ver" className={btn}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>visibility</span></button>
      <button onClick={onEditar} title="Editar tratamiento" className={btn}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span></button>
      <button onClick={exportar} disabled={exp} title="Exportar informe (IA)" className={btn}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>{exp ? "hourglass_top" : "description"}</span></button>
      <button onClick={() => { if (confirm(`¿Eliminar el escenario ${e.codigo || e.id}?`)) del.mutate(); }} title="Eliminar" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span></button>
    </div>
  );
}
