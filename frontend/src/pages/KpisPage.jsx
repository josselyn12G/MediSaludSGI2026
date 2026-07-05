import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createKpi,
  deleteKpi,
  fetchCiclosMonitoreo,
  fetchKpis,
  fetchOrganizaciones,
  updateKpi,
} from "../api/resources";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import KpiForm from "../components/KpiForm";

export default function KpisPage() {
  const qc = useQueryClient();
  const { data: kpis } = useQuery({ queryKey: ["kpis"], queryFn: fetchKpis });
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["kpis"] });
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const createMut = useMutation({ mutationFn: createKpi, onSuccess: () => { invalidate(); closeModal(); } });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateKpi(id, payload),
    onSuccess: () => { invalidate(); closeModal(); },
  });
  const deleteMut = useMutation({ mutationFn: deleteKpi, onSuccess: invalidate });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (k) => { setEditing(k); setModalOpen(true); };

  const handleSubmit = (payload) => {
    if (editing) updateMut.mutate({ id: editing.id, payload });
    else createMut.mutate(payload);
  };

  const handleDelete = (k) => {
    if (confirm(`¿Eliminar ${k.codigo} · ${k.nombre}?`)) deleteMut.mutate(k.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Indicadores Clave de Desempeño (KPIs)</h1>
          <p className="text-slate-500">Fase 6 (§9.2) · Monitoreo continuo PDCA del programa de gestión de riesgos</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          <Icon name="plus" className="h-4 w-4" /> Nuevo KPI
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(kpis || []).map((k) => (
          <div key={k.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name="chart" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-brand-600">{k.codigo}</p>
                  <p className="font-bold text-brand-900">{k.nombre}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{k.frecuencia}</span>
                <button onClick={() => openEdit(k)} className="text-slate-400 hover:text-brand-600">
                  <Icon name="edit" className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(k)} className="text-slate-400 hover:text-red-600">
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-500">{k.formula}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-center">
                <p className="text-[10px] uppercase text-slate-400">Línea base 2026</p>
                <p className="font-bold text-red-700">{k.linea_base}</p>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 p-2 text-center">
                <p className="text-[10px] uppercase text-slate-400">Meta (12 meses)</p>
                <p className="font-bold text-green-700">{k.meta}</p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
              <Icon name="bolt" className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <span>{k.umbral_alerta}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Responsable: {k.responsable}</p>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Editar ${editing.codigo}` : "Nuevo KPI"}>
        <KpiForm
          initial={editing}
          organizacionId={orgId}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={createMut.isPending || updateMut.isPending}
        />
      </Modal>

      <CicloMonitoreoSection />
    </div>
  );
}

const CICLO_COLOR = {
  Semanal: "border-red-200 bg-red-50",
  Mensual: "border-orange-200 bg-orange-50",
  Trimestral: "border-yellow-200 bg-yellow-50",
  Anual: "border-green-200 bg-green-50",
};

function CicloMonitoreoSection() {
  const { data: ciclos } = useQuery({ queryKey: ["ciclos-monitoreo"], queryFn: fetchCiclosMonitoreo });

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-brand-900">Ciclo de Monitoreo Continuo (§9.1)</h2>
      <p className="mb-3 text-sm text-slate-500">
        PDCA integrado con ISO/IEC 27005:2022 — frecuencia según nivel de riesgo
      </p>
      <div className="space-y-3">
        {(ciclos || []).map((c) => (
          <div key={c.id} className={`rounded-xl border p-4 ${CICLO_COLOR[c.frecuencia] || "border-slate-200 bg-white"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{c.frecuencia}</span>
              <span className="text-xs font-semibold text-slate-600">{c.nivel_riesgo_aplicable}</span>
              <span className="text-xs text-slate-500">{c.responsable}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700"><b>Actividades:</b> {c.actividades}</p>
            <p className="mt-1 text-sm text-slate-600"><b>Disparadores de reevaluación:</b> {c.disparadores_reevaluacion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}