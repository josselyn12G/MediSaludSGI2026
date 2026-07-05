import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAmenaza, createControl, createVulnerabilidad,
  deleteAmenaza, deleteControl, deleteVulnerabilidad,
  fetchAmenazas, fetchControles, fetchOrganizaciones, fetchVulnerabilidades,
  updateAmenaza, updateControl, updateVulnerabilidad,
} from "../api/resources";
import {
  ESCALA_DEGRADACION, ESCALA_FRC, ESCALA_TEF, FORMULAS,
  GRUPOS_AMENAZA, GRUPOS_VULN, VALOR_HEAT,
} from "../data/metodologia";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import FormulaRef from "../components/FormulaRef";
import AmenazaForm from "../components/AmenazaForm";
import VulnerabilidadForm from "../components/VulnerabilidadForm";
import ControlForm from "../components/ControlForm";

const TABS = [
  { id: "amenazas", label: "Amenazas", icon: "threats" },
  { id: "vulnerabilidades", label: "Vulnerabilidades", icon: "bolt" },
  { id: "controles", label: "Controles", icon: "lock" },
  { id: "referencia", label: "Referencia", icon: "doc" },
];

const ESTADO_BADGE = {
  ausente: "bg-red-100 text-red-700 border-red-300",
  parcial: "bg-yellow-100 text-yellow-700 border-yellow-300",
  implementado: "bg-green-100 text-green-700 border-green-300",
};

function HeatCell({ valor, children }) {
  const h = VALOR_HEAT[valor] || VALOR_HEAT[3];
  return <span className={`inline-grid h-7 min-w-[1.75rem] place-items-center rounded-md px-1.5 text-xs font-black text-white ${h.bg}`}>{children}</span>;
}

export default function AmenazasPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("amenazas");
  const [modal, setModal] = useState(null); // {tipo, editing}
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: fetchOrganizaciones });
  const orgId = orgs?.[0]?.id;

  const amenazas = useQuery({ queryKey: ["amenazas"], queryFn: () => fetchAmenazas() });
  const vulns = useQuery({ queryKey: ["vulnerabilidades"], queryFn: () => fetchVulnerabilidades() });
  const controles = useQuery({ queryKey: ["controles"], queryFn: () => fetchControles() });

  const inv = (key) => qc.invalidateQueries({ queryKey: [key] });
  const close = () => setModal(null);

  const mut = {
    amenazas: useMutation({ mutationFn: ({ id, p }) => (id ? updateAmenaza(id, p) : createAmenaza(p)), onSuccess: () => { inv("amenazas"); close(); } }),
    vulnerabilidades: useMutation({ mutationFn: ({ id, p }) => (id ? updateVulnerabilidad(id, p) : createVulnerabilidad(p)), onSuccess: () => { inv("vulnerabilidades"); close(); } }),
    controles: useMutation({ mutationFn: ({ id, p }) => (id ? updateControl(id, p) : createControl(p)), onSuccess: () => { inv("controles"); close(); } }),
  };
  const del = {
    amenazas: useMutation({ mutationFn: deleteAmenaza, onSuccess: () => inv("amenazas") }),
    vulnerabilidades: useMutation({ mutationFn: deleteVulnerabilidad, onSuccess: () => inv("vulnerabilidades") }),
    controles: useMutation({ mutationFn: deleteControl, onSuccess: () => inv("controles") }),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Amenazas y Vulnerabilidades</h1>
        <p className="text-slate-500">Catálogos MAGERIT §5.2 / §5.3 / §5.4 · F_PERT, Degradación y FRC calculados automáticamente</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon name={t.icon} className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "amenazas" && (
        <Catalogo
          titulo="Catálogo de Amenazas"
          formula="F_PERT = (F_O + 4·F_MP + F_P) / 6"
          onNew={() => setModal({ tipo: "amenazas", editing: null })}
        >
          {Object.entries(GRUPOS_AMENAZA).map(([g, label]) => {
            const rows = (amenazas.data || []).filter((a) => a.grupo === g);
            if (!rows.length) return null;
            return (
              <div key={g} className="mb-6">
                <h3 className="mb-2 text-sm font-bold text-brand-800">{label}</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-3 py-2">ID</th><th className="px-3 py-2">Amenaza</th>
                        <th className="px-3 py-2 text-center">F_O</th><th className="px-3 py-2 text-center">F_MP</th>
                        <th className="px-3 py-2 text-center">F_P</th><th className="px-3 py-2 text-center">F_PERT</th>
                        <th className="px-3 py-2 text-center">P</th><th className="px-3 py-2">CIA</th>
                        <th className="px-3 py-2 text-right">Acc.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((a) => (
                        <tr key={a.id} className={`border-t border-slate-100 ${a.es_critica ? "bg-red-50/40" : ""}`}>
                          <td className="px-3 py-2 font-mono font-bold text-brand-700">
                            {a.codigo}{a.es_critica && <span title="Crítica" className="ml-1 text-red-500">⚠</span>}
                          </td>
                          <td className="px-3 py-2"><p className="font-medium text-slate-800">{a.nombre}</p><p className="text-[11px] text-slate-400">{a.tipo}</p></td>
                          <td className="px-3 py-2 text-center text-slate-500">{a.f_o}</td>
                          <td className="px-3 py-2 text-center text-slate-500">{a.f_mp}</td>
                          <td className="px-3 py-2 text-center text-slate-500">{a.f_p}</td>
                          <td className="px-3 py-2 text-center"><HeatCell valor={a.nivel_probabilidad}>{a.f_pert}</HeatCell></td>
                          <td className="px-3 py-2 text-center font-bold text-slate-700">{a.nivel_probabilidad}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">{a.cia}</td>
                          <RowActions onEdit={() => setModal({ tipo: "amenazas", editing: a })} onDel={() => { if (confirm(`¿Eliminar ${a.codigo}?`)) del.amenazas.mutate(a.id); }} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </Catalogo>
      )}

      {tab === "vulnerabilidades" && (
        <Catalogo titulo="Catálogo de Vulnerabilidades" formula="Degradación D según severidad: MA=1.0 · A=0.8 · M=0.6 · B=0.4" onNew={() => setModal({ tipo: "vulnerabilidades", editing: null })}>
          {Object.entries(GRUPOS_VULN).map(([g, label]) => {
            const rows = (vulns.data || []).filter((v) => v.grupo === g);
            if (!rows.length) return null;
            return (
              <div key={g} className="mb-6">
                <h3 className="mb-2 text-sm font-bold text-brand-800">[{g}] {label}</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr><th className="px-3 py-2">ID</th><th className="px-3 py-2">Vulnerabilidad</th><th className="px-3 py-2 text-center">Sev.</th><th className="px-3 py-2 text-center">D</th><th className="px-3 py-2">CIA</th><th className="px-3 py-2">Amenazas</th><th className="px-3 py-2 text-right">Acc.</th></tr>
                    </thead>
                    <tbody>
                      {rows.map((v) => (
                        <tr key={v.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono font-bold text-brand-700">{v.codigo}</td>
                          <td className="px-3 py-2"><p className="font-medium text-slate-800">{v.nombre}</p><p className="text-[11px] text-slate-400">{v.descripcion}</p></td>
                          <td className="px-3 py-2 text-center"><HeatCell valor={v.severidad}>{v.severidad}</HeatCell></td>
                          <td className="px-3 py-2 text-center font-black text-slate-700">{v.degradacion?.toFixed(1)}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">{v.cia}</td>
                          <td className="px-3 py-2 text-[11px] text-slate-400">{v.amenazas_asociadas}</td>
                          <RowActions onEdit={() => setModal({ tipo: "vulnerabilidades", editing: v })} onDel={() => { if (confirm(`¿Eliminar ${v.codigo}?`)) del.vulnerabilidades.mutate(v.id); }} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Tabla de referencia · Severidad → Degradación D (§5.3) con anclas cuantitativas §5.1.5 */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
            <h3 className="font-bold text-brand-900">Tabla de referencia · Severidad → Degradación D (§5.3)</h3>
            <p className="mb-3 mt-1 text-xs text-slate-500">
              D es la fracción del valor del activo que se pierde cuando la vulnerabilidad es explotada. Las anclas económicas
              corresponden a la escala cuantitativa de valoración (§5.1.5): pérdida estimada ≈ D × valor del activo.
            </p>
            <div className="overflow-x-auto rounded-lg border border-brand-100 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                  <tr><th className="px-2 py-1.5">Severidad</th><th className="px-2 py-1.5 text-center">Valor</th><th className="px-2 py-1.5 text-center">D</th><th className="px-2 py-1.5">Pérdida del activo</th><th className="px-2 py-1.5">Ancla económica (USD)</th><th className="px-2 py-1.5">Criterio de asignación para Medisalud</th></tr>
                </thead>
                <tbody>
                  {ESCALA_DEGRADACION.map((r) => (
                    <tr key={r.severidad} className="border-t border-slate-100 align-top">
                      <td className="px-2 py-1.5"><span className={`rounded px-2 py-0.5 font-bold ${VALOR_HEAT[r.severidad].soft} ${VALOR_HEAT[r.severidad].text}`}>{r.sev}</span></td>
                      <td className="px-2 py-1.5 text-center"><HeatCell valor={r.severidad}>{r.severidad}</HeatCell></td>
                      <td className="px-2 py-1.5 text-center font-black text-brand-900">{r.d.toFixed(2)}</td>
                      <td className="px-2 py-1.5 font-semibold text-slate-700">{r.perdida}</td>
                      <td className="px-2 py-1.5 font-mono text-slate-600">{r.ancla}</td>
                      <td className="px-2 py-1.5 text-slate-500">{r.criterio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Catalogo>
      )}

      {tab === "controles" && (
        <Catalogo titulo="Controles Existentes" formula="RR = RI × FRC = VA × P × D × FRC  ·  FRC: ausente=1.0 · parcial=0.6 · implementado=0.3" onNew={() => setModal({ tipo: "controles", editing: null })}>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2">ID</th><th className="px-3 py-2">Control (ISO 27002)</th><th className="px-3 py-2">Ref.</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2 text-center">FRC</th><th className="px-3 py-2">Vuln.</th><th className="px-3 py-2 text-right">Acc.</th></tr>
              </thead>
              <tbody>
                {(controles.data || []).map((c) => (
                  <tr key={c.id} className={`border-t border-slate-100 ${c.estado === "ausente" ? "bg-red-50/40" : ""}`}>
                    <td className="px-3 py-2 font-mono font-bold text-brand-700">{c.codigo}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{c.nombre}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{c.iso_ref}</td>
                    <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ESTADO_BADGE[c.estado]}`}>{c.estado_display}</span></td>
                    <td className="px-3 py-2 text-center font-black text-slate-700">{c.frc?.toFixed(1)}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-400">{c.vulnerabilidades_mitigadas}</td>
                    <RowActions onEdit={() => setModal({ tipo: "controles", editing: c })} onDel={() => { if (confirm(`¿Eliminar ${c.codigo}?`)) del.controles.mutate(c.id); }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Catalogo>
      )}

      {tab === "referencia" && <ReferenciaTab />}

      <Modal
        open={!!modal}
        onClose={close}
        wide
        expandable
        title={modal ? `${modal.editing ? "Editar" : "Nueva"} ${ {amenazas: "amenaza", vulnerabilidades: "vulnerabilidad", controles: "control"}[modal.tipo] }` : ""}
      >
        {modal && orgId && modal.tipo === "amenazas" && (
          <AmenazaForm initial={modal.editing} organizacionId={orgId} submitting={mut.amenazas.isPending}
            onCancel={close} onSubmit={(p) => mut.amenazas.mutate({ id: modal.editing?.id, p })} />
        )}
        {modal && orgId && modal.tipo === "vulnerabilidades" && (
          <VulnerabilidadForm initial={modal.editing} organizacionId={orgId} submitting={mut.vulnerabilidades.isPending}
            onCancel={close} onSubmit={(p) => mut.vulnerabilidades.mutate({ id: modal.editing?.id, p })} />
        )}
        {modal && orgId && modal.tipo === "controles" && (
          <ControlForm initial={modal.editing} organizacionId={orgId} submitting={mut.controles.isPending}
            onCancel={close} onSubmit={(p) => mut.controles.mutate({ id: modal.editing?.id, p })} />
        )}
      </Modal>
    </div>
  );
}

function Catalogo({ titulo, formula, onNew, children }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
        <div>
          <p className="font-bold text-brand-900">{titulo}</p>
          <p className="font-mono text-xs text-slate-500">{formula}</p>
        </div>
        <button onClick={onNew} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700">
          <Icon name="spark" className="h-4 w-4" /> Nuevo
        </button>
      </div>
      {children}
    </div>
  );
}

function RowActions({ onEdit, onDel }) {
  return (
    <td className="px-3 py-2">
      <div className="flex justify-end gap-1">
        <button onClick={onEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Editar"><Icon name="doc" className="h-4 w-4" /></button>
        <button onClick={onDel} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar"><Icon name="threats" className="h-4 w-4" /></button>
      </div>
    </td>
  );
}

function ReferenciaTab() {
  return (
    <div className="space-y-6">
      {/* Tablas de escalas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <RefTable title="Escala de Probabilidad TEF (§4.3)" head={["Nivel", "P", "Rango /año"]}
          rows={ESCALA_TEF.map((t) => [t.nivel, t.valor, t.rango])} heatCol={1} />
        <RefTable title="Degradación D por severidad (§5.3)" head={["Severidad", "Sev", "D"]}
          rows={ESCALA_DEGRADACION.map((d) => [d.severidad, d.sev.split(" ")[0], d.d.toFixed(1)])} heatCol={0} />
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 font-bold text-brand-900">Factor de Reducción del Control (§5.4)</h3>
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400"><tr><th className="px-2 py-1">Estado</th><th className="px-2 py-1">FRC</th><th className="px-2 py-1">Descripción</th></tr></thead>
            <tbody>
              {ESCALA_FRC.map((f) => (
                <tr key={f.estado} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 font-semibold text-slate-700">{f.label}</td>
                  <td className="px-2 py-1.5 font-black text-brand-700">{f.frc.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-slate-500">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fórmulas de referencia con leyenda de variables */}
      <div>
        <div className="mb-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
          <p className="font-bold text-brand-900">Fórmulas de referencia</p>
          <p className="text-xs text-slate-500">
            Cada tarjeta muestra la fórmula, qué significa cada símbolo y de dónde se obtienen los datos.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {FORMULAS.map((f) => (
            <FormulaRef key={f.id} {...f} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RefTable({ title, head, rows, heatCol }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 font-bold text-brand-900">{title}</h3>
      <table className="w-full text-left text-xs">
        <thead className="text-slate-400"><tr>{head.map((h) => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {r.map((c, j) => (
                <td key={j} className="px-2 py-1.5">
                  {j === heatCol ? <HeatCell valor={Number(r[heatCol])}>{c}</HeatCell> : <span className="text-slate-600">{c}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
