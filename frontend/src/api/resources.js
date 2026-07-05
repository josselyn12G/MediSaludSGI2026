import client from "./client";

const unwrap = (data) => (Array.isArray(data) ? data : data.results ?? []);

// Activos
export const fetchActivos = (params = {}) =>
  client.get("/activos/", { params }).then((r) => unwrap(r.data));
export const fetchActivo = (id) =>
  client.get(`/activos/${id}/`).then((r) => r.data);
export const fetchActivoStats = () =>
  client.get("/activos/stats/").then((r) => r.data);
export const createActivo = (payload) =>
  client.post("/activos/", payload).then((r) => r.data);
export const updateActivo = (id, payload) =>
  client.put(`/activos/${id}/`, payload).then((r) => r.data);
export const deleteActivo = (id) => client.delete(`/activos/${id}/`);

// Tipos & procesos
export const fetchTipos = () =>
  client.get("/tipos-activo/").then((r) => unwrap(r.data));
export const fetchProcesos = () =>
  client.get("/procesos/").then((r) => unwrap(r.data));

// Organización
export const fetchOrganizaciones = () =>
  client.get("/organizacion/").then((r) => unwrap(r.data));
export const fetchOrganizacion = (id) =>
  client.get(`/organizacion/${id}/`).then((r) => r.data);

// --- Sprint 2: Amenazas / Vulnerabilidades / Controles ---
export const fetchAmenazas = (params = {}) =>
  client.get("/amenazas/", { params }).then((r) => unwrap(r.data));
export const fetchAmenazaStats = () =>
  client.get("/amenazas/stats/").then((r) => r.data);
export const createAmenaza = (p) => client.post("/amenazas/", p).then((r) => r.data);
export const updateAmenaza = (id, p) => client.put(`/amenazas/${id}/`, p).then((r) => r.data);
export const deleteAmenaza = (id) => client.delete(`/amenazas/${id}/`);

export const fetchVulnerabilidades = (params = {}) =>
  client.get("/vulnerabilidades/", { params }).then((r) => unwrap(r.data));
export const createVulnerabilidad = (p) => client.post("/vulnerabilidades/", p).then((r) => r.data);
export const updateVulnerabilidad = (id, p) => client.put(`/vulnerabilidades/${id}/`, p).then((r) => r.data);
export const deleteVulnerabilidad = (id) => client.delete(`/vulnerabilidades/${id}/`);

export const fetchControles = (params = {}) =>
  client.get("/controles/", { params }).then((r) => unwrap(r.data));
export const createControl = (p) => client.post("/controles/", p).then((r) => r.data);
export const updateControl = (id, p) => client.put(`/controles/${id}/`, p).then((r) => r.data);
export const deleteControl = (id) => client.delete(`/controles/${id}/`);

// --- Sprint 3: Riesgos / Tratamiento / KPIs ---
export const fetchEscenarios = (params = {}) =>
  client.get("/escenarios/", { params }).then((r) => unwrap(r.data));
export const fetchEscenarioStats = () =>
  client.get("/escenarios/stats/").then((r) => r.data);
export const simularEscenario = (id, n = 10000) =>
  client.get(`/escenarios/${id}/simular/`, { params: { n } }).then((r) => r.data);
export const createEscenario = (p) => client.post("/escenarios/", p).then((r) => r.data);
export const updateEscenario = (id, p) => client.put(`/escenarios/${id}/`, p).then((r) => r.data);
export const deleteEscenario = (id) => client.delete(`/escenarios/${id}/`);

export const fetchPlanes = (params = {}) =>
  client.get("/planes-tratamiento/", { params }).then((r) => unwrap(r.data));
export const fetchPlanStats = () =>
  client.get("/planes-tratamiento/stats/").then((r) => r.data);

export const fetchKpis = () => client.get("/kpis/").then((r) => unwrap(r.data));
export const createKpi = (payload) =>
  client.post("/kpis/", payload).then((r) => r.data);
export const updateKpi = (id, payload) =>
  client.put(`/kpis/${id}/`, payload).then((r) => r.data);
export const deleteKpi = (id) => client.delete(`/kpis/${id}/`);

export const fetchCiclosMonitoreo = () =>
  client.get("/ciclos-monitoreo/").then((r) => unwrap(r.data));

export const fetchTareasMonitoreo = (params = {}) =>
  client.get("/tareas-monitoreo/", { params }).then((r) => unwrap(r.data));
export const createTareaMonitoreo = (payload) =>
  client.post("/tareas-monitoreo/", payload).then((r) => r.data);
export const updateTareaMonitoreo = (id, payload) =>
  client.patch(`/tareas-monitoreo/${id}/`, payload).then((r) => r.data);
export const deleteTareaMonitoreo = (id) => client.delete(`/tareas-monitoreo/${id}/`);

// --- Fase 1: Establecimiento del Contexto (parámetros fijos, solo lectura) ---
export const fetchContexto = () =>
  client.get("/contexto/").then((r) => r.data);
export const fetchContextoImpacto = () =>
  client.get("/contexto/impacto/").then((r) => r.data);
export const fetchContextoProbabilidad = () =>
  client.get("/contexto/probabilidad/").then((r) => r.data);
export const fetchContextoAceptacion = () =>
  client.get("/contexto/aceptacion/").then((r) => r.data);
export const fetchContextoMapaCalor = () =>
  client.get("/contexto/mapa-calor/").then((r) => r.data);
export const fetchContextoFormulas = () =>
  client.get("/contexto/formulas/").then((r) => r.data);

// --- Sprint 2: Escenarios de Riesgo (wizard de 8 pasos) ----------------------
export const fetchEscenariosRiesgo = (params = {}) =>
  client.get("/escenarios-riesgo/", { params }).then((r) => unwrap(r.data));
export const fetchEscenarioRiesgo = (id) =>
  client.get(`/escenarios-riesgo/${id}/`).then((r) => r.data);
export const fetchEscenarioRiesgoStats = () =>
  client.get("/escenarios-riesgo/stats/").then((r) => r.data);
export const createEscenarioRiesgo = (p) =>
  client.post("/escenarios-riesgo/", p).then((r) => r.data);
export const updateEscenarioRiesgo = (id, p) =>
  client.patch(`/escenarios-riesgo/${id}/`, p).then((r) => r.data);
export const deleteEscenarioRiesgo = (id) => client.delete(`/escenarios-riesgo/${id}/`);
export const patchEscenarioTef = (id, p) =>
  client.patch(`/escenarios-riesgo/${id}/tef/`, p).then((r) => r.data);
export const calcularEscenario = (id, n = 10000) =>
  client.post(`/escenarios-riesgo/${id}/calcular/`, { n }).then((r) => r.data);
export const patchEscenarioTratamiento = (id, p) =>
  client.patch(`/escenarios-riesgo/${id}/tratamiento/`, p).then((r) => r.data);
export const fetchLMImpacto = () => client.get("/lm-impacto/").then((r) => r.data);
export const patchControlEstado = (id, estado) =>
  client.patch(`/controles/${id}/estado/`, { estado }).then((r) => r.data);
export const fetchGruposAmenaza = () =>
  client.get("/grupos-amenaza/").then((r) => unwrap(r.data));

// --- Asistente IA (proxy a OpenAI; la key vive solo en sessionStorage) -------
export const IA_KEY_STORAGE = "medisalud_openai_key";
export const getIaKey = () => sessionStorage.getItem(IA_KEY_STORAGE) || "";
export const setIaKey = (k) => sessionStorage.setItem(IA_KEY_STORAGE, k || "");
export const clearIaKey = () => sessionStorage.removeItem(IA_KEY_STORAGE);

// tipo: "tef_contexto" | "sugerencia_tratamiento" | "informe_ejecutivo"
export const consultarIA = (tipo, payload, { modelo } = {}) =>
  client
    .post("/ia/consultar/", { tipo, payload, openai_key: getIaKey(), modelo })
    .then((r) => r.data);
