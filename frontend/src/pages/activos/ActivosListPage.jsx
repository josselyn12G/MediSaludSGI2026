import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createActivo,
  deleteActivo,
  fetchActivos,
  fetchOrganizaciones,
  fetchProcesos,
  fetchTipos,
  updateActivo,
} from "../../api/resources";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import ActivoForm from "../../components/ActivoForm";
import HeatMap5x5 from "../../components/HeatMap5x5";
import { ESCALA_VALORACION, NIVELES_VAD, NIVELES_VAG, NOTA_LOPDP_MA, TIPOLOGIA, VALOR_HEAT } from "../../data/metodologia";

export default function ActivosListPage() {
  const qc = useQueryClient();
  const [filtros, setFiltros] = useState({ tipo: "", nivel_criticidad: "", proceso_asociado: "", search: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showRef, setShowRef] = useState(false);

  const { data: tipos } = useQuery({ queryKey: ["tipos"], queryFn: fetchTipos });
  const { data: procesos } = useQuery({ queryKey: ["procesos"], queryFn: fetchProcesos });
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;

  const params = useMemo(() => {
    const p = {};
    if (filtros.tipo) p.tipo = filtros.tipo;
    if (filtros.nivel_criticidad) p.nivel_criticidad = filtros.nivel_criticidad;
    if (filtros.proceso_asociado) p.proceso_asociado = filtros.proceso_asociado;
    if (filtros.search) p.search = filtros.search;
    return p;
  }, [filtros]);

  const { data: activos, isLoading } = useQuery({
    queryKey: ["activos", params],
    queryFn: () => fetchActivos(params),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["activos"] });
    qc.invalidateQueries({ queryKey: ["activo-stats"] });
  };

  const createMut = useMutation({
    mutationFn: createActivo,
    onSuccess: () => { invalidate(); closeModal(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateActivo(id, payload),
    onSuccess: () => { invalidate(); closeModal(); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteActivo,
    onSuccess: invalidate,
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (payload) => {
    if (editing) updateMut.mutate({ id: editing.id, payload });
    else createMut.mutate(payload);
  };

  const setF = (k) => (e) => setFiltros((p) => ({ ...p, [k]: e.target.value }));
  const selectCls = "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">Inventario de Activos</h1>
          <p className="text-slate-500">Valoración multidimensional MAGERIT v3.0 · {activos?.length || 0} activos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRef((s) => !s)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Icon name="doc" className="h-4 w-4" /> Tablas de referencia
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700">
            <Icon name="spark" className="h-4 w-4" /> Nuevo activo
          </button>
        </div>
      </div>

      {showRef && <ReferenceTables />}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Buscar por código o nombre…"
            value={filtros.search}
            onChange={setF("search")}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <select className={selectCls} value={filtros.tipo} onChange={setF("tipo")}>
          <option value="">Todos los tipos</option>
          {tipos?.map((t) => <option key={t.id} value={t.id}>{t.codigo} · {t.nombre}</option>)}
        </select>
        <select className={selectCls} value={filtros.nivel_criticidad} onChange={setF("nivel_criticidad")}>
          <option value="">Todos los niveles</option>
          {["Crítico", "Alto", "Medio", "Bajo"].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className={selectCls} value={filtros.proceso_asociado} onChange={setF("proceso_asociado")}>
          <option value="">Todos los procesos</option>
          {procesos?.map((p) => <option key={p.id} value={p.id}>{p.codigo}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Proceso</th>
              <th className="px-4 py-3 text-center">VA</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">NC</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400">Cargando…</td></tr>
            ) : activos?.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400">Sin resultados</td></tr>
            ) : activos?.map((a) => (
              <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-mono font-semibold text-brand-700">{a.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{a.nombre}</td>
                <td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{a.tipo_codigo}</span></td>
                <td className="px-4 py-3 text-slate-500">{a.proceso_codigo || "—"}</td>
                <td className="px-4 py-3 text-center font-black text-brand-900">{a.va_normalizado}</td>
                <td className="px-4 py-3"><Badge nivel={a.nivel_criticidad} /></td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-500">{a.clasificacion_nc}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link to={`/activos/${a.id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Ver detalle">
                      <Icon name="search" className="h-4 w-4" />
                    </Link>
                    <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Editar">
                      <Icon name="doc" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar ${a.codigo}?`)) deleteMut.mutate(a.id); }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Icon name="threats" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Editar ${editing.codigo}` : "Nuevo activo"} wide expandable>
        {(tipos && orgId) && (
          <ActivoForm
            initial={editing}
            tipos={tipos}
            procesos={procesos}
            organizacionId={orgId}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            submitting={createMut.isPending || updateMut.isPending}
          />
        )}
      </Modal>
    </div>
  );
}

function ReferenceTables() {
  return (
    <div className="space-y-5 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
      <div>
        <h3 className="mb-2 font-bold text-brand-900">Tipología de activos (§5.1.2)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400">
              <tr><th className="px-2 py-1">Código</th><th className="px-2 py-1">Tipo</th><th className="px-2 py-1">Ejemplos</th></tr>
            </thead>
            <tbody>
              {TIPOLOGIA.map((t) => (
                <tr key={t.cod} className="border-t border-brand-100">
                  <td className="px-2 py-1.5 font-mono font-bold text-brand-700">{t.cod}</td>
                  <td className="px-2 py-1.5 font-medium text-slate-700">{t.tipo}</td>
                  <td className="px-2 py-1.5 text-slate-500">{t.ejemplos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-bold text-brand-900">Escala cuantitativa de valoración (§5.1.5)</h3>
        <p className="mb-2 text-xs text-slate-500">
          Escala ordinal de cinco niveles de MAGERIT v3.0 con anclas económicas en USD calibradas para el sector salud
          privado ecuatoriano, alineadas con los umbrales de impacto de la Fase 1 (§4.2), la LOPDP Ecuador y la Guía
          SPDP-SPD-2025-0003-R.
        </p>
        <div className="overflow-x-auto rounded-lg border border-brand-100 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                <th className="px-2 py-1.5">Nivel</th>
                <th className="px-2 py-1.5">Valor</th>
                <th className="px-2 py-1.5">Descriptor cualitativo</th>
                <th className="px-2 py-1.5">Ancla económica (USD)</th>
                <th className="px-2 py-1.5">Criterio de asignación para Medisalud</th>
              </tr>
            </thead>
            <tbody>
              {ESCALA_VALORACION.map((r) => (
                <tr key={r.nivel} className="border-t border-slate-100">
                  <td className="px-2 py-1.5">
                    <span className={`rounded px-2 py-0.5 font-bold ${VALOR_HEAT[r.valor].soft} ${VALOR_HEAT[r.valor].text}`}>{r.nivel}</span>
                  </td>
                  <td className="px-2 py-1.5 font-black text-brand-900">{r.valor}</td>
                  <td className="px-2 py-1.5 font-medium text-slate-700">{r.descriptor}</td>
                  <td className="px-2 py-1.5 font-mono text-slate-600">{r.ancla}</td>
                  <td className="px-2 py-1.5 text-slate-500">{r.criterio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg border-l-4 border-brand-500 bg-brand-50 p-3 text-xs">
          <p className="font-bold text-brand-900">📌 {NOTA_LOPDP_MA.titulo}</p>
          <p className="mt-1 text-slate-600">{NOTA_LOPDP_MA.texto}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PriorityTable title="Niveles de prioridad · Activos Generales VAG 6–30 (§5.1.8)" rows={NIVELES_VAG} />
        <PriorityTable title="Niveles de prioridad · Activos Digitales VAD 8–40 (§5.1.10)" rows={NIVELES_VAD} />
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-4">
        <h3 className="mb-3 font-bold text-brand-900">Mapa de calor 5×5 · RR = P × I (§4.4.2)</h3>
        <HeatMap5x5 />
      </div>
    </div>
  );
}

function PriorityTable({ title, rows }) {
  return (
    <div>
      <h3 className="mb-2 font-bold text-brand-900">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400">
            <tr><th className="px-2 py-1.5">Rango</th><th className="px-2 py-1.5">Nivel</th><th className="px-2 py-1.5">VA</th><th className="px-2 py-1.5">NC</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rango} className="border-t border-slate-100">
                <td className="px-2 py-1.5 font-mono text-slate-600">{r.rango}</td>
                <td className="px-2 py-1.5"><Badge nivel={r.nivel} /></td>
                <td className="px-2 py-1.5 font-bold text-brand-700">{r.va}</td>
                <td className="px-2 py-1.5 text-slate-500">{r.nc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
