// Datos de referencia extraídos del documento metodológico (Medisalud Integral S.A.)

export const NIVEL_STYLES = {
  "Crítico": "bg-red-100 text-red-800 border-red-300",
  "Alto": "bg-orange-100 text-orange-800 border-orange-300",
  "Medio": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Bajo": "bg-green-100 text-green-800 border-green-300",
};

export const DESCRIPTOR_NIVEL = {
  1: "MB · Muy Bajo",
  2: "B · Bajo",
  3: "M · Medio",
  4: "A · Alto",
  5: "MA · Muy Alto",
};

// Escala cuantitativa de valoración (§5.1.5)
export const ESCALA_VALORACION = [
  { nivel: "MA", valor: 5, descriptor: "Activo crítico para la misión clínica", ancla: "> $500K de pérdida esperada", criterio: "Su compromiso causa paralización total de operaciones clínicas, multa SPDP > $500K o demanda colectiva bajo LOPDP Art. 42. Imposible sustituir a corto plazo." },
  { nivel: "A", valor: 4, descriptor: "Activo esencial para procesos core", ancla: "$100K – $500K de pérdida", criterio: "Afecta procesos críticos como atención médica o facturación electrónica. Pérdidas $100K–$500K o incumplimiento regulatorio severo (SRI, MSP)." },
  { nivel: "M", valor: 3, descriptor: "Activo importante con impacto moderado", ancla: "$10K – $100K de pérdida", criterio: "Degradación del servicio de Medisalud. Pérdidas $10K–$100K o afectación reputacional moderada. Proceso recuperable en horas." },
  { nivel: "B", valor: 2, descriptor: "Activo de soporte con impacto limitado", ancla: "$1K – $10K de pérdida", criterio: "Inconveniencias operativas internas. Pérdidas $1K–$10K o afectación de procesos no críticos. Recuperable sin costo significativo." },
  { nivel: "MB", valor: 1, descriptor: "Activo prescindible o de impacto mínimo", ancla: "< $1K de pérdida", criterio: "Impacto despreciable sobre las operaciones de Medisalud. Pérdidas < $1K o sin consecuencias apreciables para pacientes o procesos." },
];

// Nota normativa LOPDP asociada a la escala (§5.1.5)
export const NOTA_LOPDP_MA = {
  titulo: "LOPDP — Nivel MA automático",
  texto:
    "Todo activo de Medisalud Integral S.A. que procese datos de salud de pacientes (historias clínicas, resultados de laboratorio, datos de telemedicina) recibe automáticamente el nivel MA (5) en la dimensión [C] — Confidencialidad, conforme a LOPDP Art. 5 (categoría especial) y Guía SPDP-SPD-2025-0003-R §1.3. Este valor no puede ser reducido por el evaluador sin justificación escrita aprobada por el Responsable de Protección de Datos.",
};

// Dimensiones de seguridad (§5.1.6)
export const DIMENSIONES = [
  { cod: "C", key: "dim_confidencialidad", nombre: "Confidencialidad", pregunta: "¿Cuántos USD de pérdida directa (multas, demandas, lucro cesante) sufriría Medisalud si este activo fuera divulgado sin autorización?", escala: "1=<$1K · 2=$1K–10K · 3=$10K–100K · 4=$100K–500K · 5=>$500K o multa SPDP", aplica: "Todos" },
  { cod: "I", key: "dim_integridad", nombre: "Integridad", pregunta: "¿Cuántos USD de pérdida sufriría Medisalud si este activo fuera alterado sin autorización?", escala: "1=<$1K · 2=$1K–10K · 3=$10K–100K · 4=$100K–500K · 5=>$500K o consecuencias clínicas", aplica: "Todos" },
  { cod: "D", key: "dim_disponibilidad", nombre: "Disponibilidad", pregunta: "¿Cuántos USD por hora pierde Medisalud si este activo no está disponible?", escala: "1=<$1K/día · 2=$1K–10K/día · 3=$10K–100K/día · 4=$100K–500K/día · 5=>$500K o paralización clínica", aplica: "Todos" },
  { cod: "Legal", key: "dim_legal", nombre: "Legal / Regulatorio", pregunta: "¿Qué multa máxima o sanción legal podría enfrentar Medisalud si este activo se ve comprometido? (LOPDP, SRI, MSP)", escala: "1=sin riesgo · 2=$1K–10K · 3=$10K–100K · 4=$100K–500K · 5=>$500K o inhabilitación", aplica: "Todos" },
  { cod: "Ope", key: "dim_operativo", nombre: "Operativo", pregunta: "¿Cuántos procesos críticos de Medisalud se paralizarían si este activo fallara?", escala: "1=sin impacto · 2=1 proceso <$10K · 3=1–2 procesos $10K–100K · 4=>2 procesos $100K–500K · 5=paralización total >$500K", aplica: "Todos" },
  { cod: "Eco", key: "dim_economico", nombre: "Económico", pregunta: "¿Cuál es la pérdida financiera total (directa + indirecta) para Medisalud si este activo se compromete?", escala: "1=<$1K · 2=$1K–10K · 3=$10K–100K · 4=$100K–500K · 5=>$500K o insolvencia operativa", aplica: "Todos" },
  { cod: "Exp", key: "dim_exposicion", nombre: "Exposición", pregunta: "¿El activo es accesible desde internet o redes públicas sin autenticación? ¿Tiene CVEs críticos sin parchear?", escala: "1=solo intranet con MFA · 2=intranet sin MFA · 3=extranet B2B · 4=internet con auth · 5=internet sin auth o CVSS≥9.0", aplica: "Solo archivos digitales (AD)" },
  { cod: "Sen", key: "dim_sensibilidad", nombre: "Sensibilidad del contenido", pregunta: "¿El activo contiene datos personales sensibles o información médica regulada (LOPDP Art. 5)?", escala: "1=datos públicos · 2=datos internos · 3=datos confidenciales · 4=datos personales comunes · 5=datos personales especiales (salud)", aplica: "Solo archivos digitales (AD)" },
];

// Niveles de prioridad - Activos Generales (§5.1.8 / §5.1.12)
export const NIVELES_VAG = [
  { rango: "26 – 30", nivel: "Crítico", va: "5", nc: "NC-5", controles: "MFA, cifrado AES-256, segmentación de red, backup diario offline probado, plan de respuesta a incidentes.", revision: "Monitoreo continuo · Revisión trimestral" },
  { rango: "19 – 25", nivel: "Alto", va: "4", nc: "NC-4", controles: "MFA en accesos principales, cifrado TLS 1.2+, backup semanal, gestión de parches mensual, registro de accesos.", revision: "Revisión trimestral · Monitoreo de logs" },
  { rango: "12 – 18", nivel: "Medio", va: "3", nc: "NC-3", controles: "Contraseñas robustas, cifrado básico, backup quincenal, revisión semestral de permisos, antivirus actualizado.", revision: "Revisión semestral · Auditoría anual" },
  { rango: "6 – 11", nivel: "Bajo", va: "1–2", nc: "NC-1 / NC-2", controles: "Políticas básicas de acceso, registro en inventario, revisión anual de propietario y estado.", revision: "Revisión anual" },
];

// Niveles de prioridad - Activos Digitales (§5.1.10 / §5.1.13)
export const NIVELES_VAD = [
  { rango: "34 – 40", nivel: "Crítico", va: "5", nc: "NC-5", controles: "Cifrado AES-256 obligatorio, acceso estricto con MFA, auditoría de accesos, backup diario offline. Sujeto a LOPDP Art. 42 (EIPD).", revision: "Notificación SPDP en 72h ante brecha (Art. 38)" },
  { rango: "25 – 33", nivel: "Alto", va: "4", nc: "NC-4", controles: "Cifrado en tránsito TLS 1.2+, restricción de acceso, monitoreo de descargas, backup semanal probado.", revision: "Revisión inmediata de permisos" },
  { rango: "16 – 24", nivel: "Medio", va: "3", nc: "NC-3", controles: "Políticas de acceso definidas, cifrado básico, revisión semestral, backup quincenal.", revision: "Validar exposición adecuada" },
  { rango: "8 – 15", nivel: "Bajo", va: "1–2", nc: "NC-1 / NC-2", controles: "Acceso restringido a propietarios, sin cifrado específico requerido.", revision: "Revisión anual de propietario" },
];

// Tipología de activos (§5.1.2)
export const TIPOLOGIA = [
  { cod: "INF", tipo: "Información / Datos", desc: "Activos de información en cualquier soporte o formato", ejemplos: "Bases de datos, historias clínicas, resultados de laboratorio" },
  { cod: "AD", tipo: "Archivos Digitales", desc: "Documentos almacenados en sistemas, endpoints o nube", ejemplos: "PDF, DOCX, XLSX, CSV, SQL, ZIP, backups, scripts" },
  { cod: "SW", tipo: "Software / Aplicaciones", desc: "Aplicaciones y plataformas para operar procesos", ejemplos: "SGM, portal de citas, facturación, telemedicina" },
  { cod: "HW", tipo: "Hardware / Equipos", desc: "Equipos físicos que procesan o almacenan información", ejemplos: "Firewall, servidores, laptops médicas" },
  { cod: "SVC", tipo: "Servicios Tecnológicos", desc: "Servicios internos, externos o en la nube", ejemplos: "Correo, VPN, almacenamiento cloud, pasarela de pagos" },
  { cod: "IAM", tipo: "Identidades y Accesos", desc: "Cuentas, credenciales y mecanismos de acceso", ejemplos: "Cuentas admin, cuenta DBA, credenciales API" },
  { cod: "PER", tipo: "Personas / Roles Críticos", desc: "Personas con roles críticos o conocimiento clave", ejemplos: "DBA, Responsable de protección de datos" },
  { cod: "PRO", tipo: "Procesos de Negocio", desc: "Procesos clave del negocio", ejemplos: "Atención médica, agendamiento, facturación" },
  { cod: "REP", tipo: "Reputación e Imagen", desc: "Valor intangible de marca e imagen institucional", ejemplos: "Sitio web institucional" },
  { cod: "TERC", tipo: "Terceros / Proveedores", desc: "Proveedores externos críticos", ejemplos: "Hosting, facturación electrónica, cloud" },
];

// Estrategias de tratamiento aplicables (§8.1 · ISO/IEC 27005:2022)
export const ESTRATEGIAS_INTRO =
  "ISO/IEC 27005:2022 define cuatro estrategias de tratamiento. Para Medisalud Integral S.A., la estrategia seleccionada en cada escenario responde a un análisis costo-beneficio que compara el costo anualizado del control contra la reducción de ALE_PERT esperada. El resultado neto debe ser positivo para justificar la inversión; de lo contrario se documenta la aceptación formal con aprobación de Gerencia.";
export const ESTRATEGIAS_TRATAMIENTO = [
  {
    estrategia: "MITIGAR",
    definicion: "Implementar controles técnicos u organizativos que reduzcan la probabilidad (TEF) o el impacto (LM) del escenario.",
    cuando: "Cuando el costo del control < ALE_PERT reducido. Prioridad absoluta para escenarios CRÍTICOS (RR≥20).",
  },
  {
    estrategia: "TRANSFERIR",
    definicion: "Transferir el impacto financiero a un tercero mediante ciberseguro, contrato SLA o externalización del servicio.",
    cuando: "Cuando el riesgo residual es MEDIO y el costo del seguro o SLA < ALE_P50. No elimina el riesgo operativo.",
  },
  {
    estrategia: "ACEPTAR",
    definicion: "Aceptar formalmente el riesgo residual cuando el costo del control supera el ALE_P50 de Monte Carlo para ese escenario.",
    cuando: "Solo para riesgos MEDIO o BAJO con justificación documentada y aprobación de Gerencia Administrativa. No aplica a CRÍTICOS ni ALTOS.",
  },
  {
    estrategia: "EVITAR",
    definicion: "Eliminar la actividad o proceso que genera el riesgo cuando la exposición es inaceptable y no puede mitigarse.",
    cuando: "Cuando un servicio o módulo del SGM presenta RR=25 sin posibilidad de control efectivo a corto plazo.",
  },
];

// Fases del ciclo ISO 27005 (para landing y navbar)
export const FASES = [
  { n: 1, nombre: "Establecimiento del Contexto", desc: "Define criterios cuantitativos y de aceptación del riesgo.", icon: "context" },
  { n: 2, nombre: "Identificación de Activos", desc: "Inventario y valoración multidimensional MAGERIT.", icon: "assets" },
  { n: 3, nombre: "Amenazas y Vulnerabilidades", desc: "Catálogos FAIR con frecuencia anualizada (TEF).", icon: "threats" },
  { n: 4, nombre: "Valoración FAIR + Monte Carlo", desc: "RI = VA×P×D y ALE con percentiles P90/P95.", icon: "calc" },
  { n: 5, nombre: "Tratamiento de Riesgos", desc: "Mitigar, transferir, aceptar o evitar con ROI.", icon: "treat" },
  { n: 6, nombre: "Monitoreo y Mejora", desc: "Ciclo PDCA con KPIs e indicadores cuantitativos.", icon: "monitor" },
];

// Color por valor 1–5 (mapa de calor) — verde→rojo
export const VALOR_HEAT = {
  1: { bg: "bg-green-500", text: "text-green-700", soft: "bg-green-100", label: "Muy Bajo" },
  2: { bg: "bg-lime-500", text: "text-lime-700", soft: "bg-lime-100", label: "Bajo" },
  3: { bg: "bg-yellow-500", text: "text-yellow-700", soft: "bg-yellow-100", label: "Medio" },
  4: { bg: "bg-orange-500", text: "text-orange-700", soft: "bg-orange-100", label: "Alto" },
  5: { bg: "bg-red-500", text: "text-red-700", soft: "bg-red-100", label: "Muy Alto" },
};

// Extrae el ancla económica de una dimensión para un valor (de su cadena "escala")
export function anclaDimension(dimKey, valor) {
  const dim = DIMENSIONES.find((d) => d.key === dimKey);
  if (!dim) return "";
  const parts = dim.escala.split("·").map((s) => s.trim());
  const match = parts.find((p) => p.startsWith(`${valor}=`));
  return match ? match.split("=")[1] : "";
}

// Mapa de calor 5×5 P×I (§4.4.2) — valor = P×I y su nivel
export function nivelRR(rr) {
  if (rr >= 20) return "Crítico";
  if (rr >= 12) return "Alto";
  if (rr >= 6) return "Medio";
  return "Bajo";
}

// --- Sprint 2: Amenazas / Vulnerabilidades / Controles -----------------------

// Escala de probabilidad TEF (§4.3)
export const ESCALA_TEF = [
  { nivel: "Muy Alta", valor: 5, rango: "> 52/año", desc: "Ocurrencia prácticamente segura; amenaza activa" },
  { nivel: "Alta", valor: 4, rango: "1 – 12/año", desc: "Incidentes recurrentes en el sector salud" },
  { nivel: "Media", valor: 3, rango: "0.1 – 1/año", desc: "Ha ocurrido en el sector en los últimos 3 años" },
  { nivel: "Baja", valor: 2, rango: "0.01 – 0.1/año", desc: "Poco probable; requiere condiciones específicas" },
  { nivel: "Muy Baja", valor: 1, rango: "< 0.01/año", desc: "Teóricamente posible; control efectivo" },
];

// Degradación D según severidad de la vulnerabilidad (§5.3)
// Anclas cuantitativas alineadas con la escala de valoración §5.1.5 (D × valor del activo)
export const ESCALA_DEGRADACION = [
  { severidad: 5, sev: "MA · Muy Alta", d: 1.0, desc: "Compromiso total del activo", perdida: "100% del valor del activo", ancla: "> $500K en activos críticos (MA)", criterio: "La explotación destruye o expone por completo el activo: cifrado total por ransomware, exfiltración íntegra de la BD de pacientes, pérdida irrecuperable." },
  { severidad: 4, sev: "A · Alta", d: 0.8, desc: "Pérdida mayoritaria del valor", perdida: "80% del valor del activo", ancla: "$100K – $500K", criterio: "Compromiso extenso con recuperación parcial posible: exfiltración de gran parte de los registros, corrupción severa con backups desactualizados." },
  { severidad: 3, sev: "M · Media", d: 0.6, desc: "Pérdida moderada", perdida: "60% del valor del activo", ancla: "$10K – $100K", criterio: "Afectación significativa pero contenida: acceso indebido a un subconjunto de datos, indisponibilidad de horas con degradación del servicio." },
  { severidad: 2, sev: "B · Baja", d: 0.4, desc: "Pérdida limitada", perdida: "40% del valor del activo", ancla: "$1K – $10K", criterio: "Impacto localizado y recuperable: alteración menor detectada a tiempo, interrupción breve de procesos no críticos." },
  { severidad: 1, sev: "MB · Muy Baja", d: 0.2, desc: "Pérdida mínima", perdida: "20% del valor del activo", ancla: "< $1K", criterio: "Efecto marginal sin consecuencias apreciables para pacientes o procesos: molestia operativa interna, sin exposición de datos." },
];

// Factor de Reducción del Control FRC (§5.4)
export const ESCALA_FRC = [
  { estado: "ausente", label: "Ausente", frc: 1.0, desc: "Sin reducción · RR = RI" },
  { estado: "parcial", label: "Parcial", frc: 0.6, desc: "Implementación parcial" },
  { estado: "implementado", label: "Implementado y auditado", frc: 0.3, desc: "Control completo" },
];

export const GRUPOS_AMENAZA = {
  N: "[N] Desastres Naturales",
  I: "[I] De Origen Industrial",
  E: "[E] Errores y Fallos No Intencionados",
  A: "[A] Ataques Intencionados",
};

export const GRUPOS_VULN = {
  VT: "Vulnerabilidades Tecnológicas",
  VO: "Vulnerabilidades Organizacionales",
  VP: "Vulnerabilidades de Proceso",
};

export function formatUSD(n) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

export function fPert(o, mp, p) {
  return Math.round(((Number(o) + 4 * Number(mp) + Number(p)) / 6) * 1000) / 1000;
}

export function nivelProbabilidad(fp) {
  if (fp > 52) return 5;
  if (fp >= 1) return 4;
  if (fp >= 0.1) return 3;
  if (fp >= 0.01) return 2;
  return 1;
}

export const DEGRADACION_POR_SEVERIDAD = { 5: 1.0, 4: 0.8, 3: 0.6, 2: 0.4, 1: 0.2 };
export const FRC_POR_ESTADO = { ausente: 1.0, parcial: 0.6, implementado: 0.3 };

// =============================================================================
// FÓRMULAS DE REFERENCIA (leyenda · qué significa cada término y de dónde sale)
// Usadas por el módulo de Contexto, Amenazas/Vulnerabilidades y Riesgos.
// =============================================================================

export const FORMULAS = [
  {
    id: "fpert",
    fase: "Fase 3 · Amenazas",
    titulo: "Frecuencia anualizada esperada (TEF · Beta-PERT)",
    formula: "F_PERT = (F_O + 4·F_MP + F_P) / 6",
    descripcion:
      "Estima cuántas veces al año puede materializarse una amenaza ponderando tres juicios de experto. El factor 4 da mayor peso al valor más probable (esperanza de la distribución Beta-PERT).",
    variables: [
      { sim: "F_O", nombre: "Frecuencia optimista", desc: "Mínimo de ocurrencias/año (mejor escenario realista)." },
      { sim: "F_MP", nombre: "Frecuencia más probable", desc: "Moda: ocurrencias/año más esperadas según el histórico." },
      { sim: "F_P", nombre: "Frecuencia pesimista", desc: "Máximo de ocurrencias/año (peor escenario realista)." },
      { sim: "F_PERT", nombre: "Frecuencia PERT (TEF)", desc: "Frecuencia anual esperada ponderada (eventos/año)." },
    ],
    fuente:
      "El analista estima O / MP / P a partir de incidentes históricos de Medisalud, reportes del sector salud, boletines CSIRT, y CVEs publicados.",
  },
  {
    id: "nivelP",
    fase: "Fase 3 · Amenazas",
    titulo: "Nivel ordinal de probabilidad (P)",
    formula: "P = mapa(F_PERT) → 1…5",
    descripcion:
      "Convierte la frecuencia continua F_PERT (eventos/año) en un nivel ordinal 1–5 para la matriz de riesgo, según la escala §4.3.",
    variables: [
      { sim: "F_PERT", nombre: "Frecuencia PERT", desc: "Eventos/año calculados con la fórmula TEF." },
      { sim: "P", nombre: "Nivel de probabilidad", desc: "5 si >52/año · 4 si ≥1 · 3 si ≥0.1 · 2 si ≥0.01 · 1 si <0.01." },
    ],
    fuente: "Umbrales de la Escala de Probabilidad TEF (tabla §4.3).",
  },
  {
    id: "degradacion",
    fase: "Fase 3 · Vulnerabilidades",
    titulo: "Degradación del activo (D)",
    formula: "D = factor(severidad)  →  MA=1.0 · A=0.8 · M=0.6 · B=0.4 · MB=0.2",
    descripcion:
      "Fracción del valor del activo que se pierde si la vulnerabilidad es explotada. A mayor severidad, mayor degradación.",
    variables: [
      { sim: "severidad", nombre: "Severidad de la vulnerabilidad", desc: "Nivel 1–5 (MB…MA) asignado por el analista." },
      { sim: "D", nombre: "Degradación", desc: "Factor 0.2–1.0 que multiplica el valor del activo expuesto." },
    ],
    fuente: "Tabla de Degradación por severidad (§5.3). Se calcula automáticamente al guardar la vulnerabilidad.",
  },
  {
    id: "frc",
    fase: "Fase 3 · Controles",
    titulo: "Factor de Reducción del Control (FRC)",
    formula: "FRC = factor(estado)  →  ausente=1.0 · parcial=0.6 · implementado=0.3",
    descripcion:
      "Mide cuánto del riesgo inherente permanece tras aplicar los controles existentes. FRC=1.0 significa que el control no reduce nada; 0.3 que un control auditado deja solo el 30% del riesgo.",
    variables: [
      { sim: "estado", nombre: "Estado del control", desc: "Ausente, Parcial, o Implementado y auditado (ISO 27002)." },
      { sim: "FRC", nombre: "Factor de reducción", desc: "Multiplicador 0.3–1.0 aplicado al riesgo inherente." },
    ],
    fuente: "Tabla FRC (§5.4). Se calcula automáticamente según el estado registrado del control.",
  },
  {
    id: "ri",
    fase: "Fase 4 · Valoración",
    titulo: "Riesgo Inherente (RI)",
    formula: "RI = VA × P × D",
    descripcion:
      "Riesgo cualitativo antes de considerar controles. Combina el valor del activo, la probabilidad de la amenaza y la degradación de la vulnerabilidad.",
    variables: [
      { sim: "VA", nombre: "Valor del activo", desc: "Nivel 1–5 obtenido en la Fase 2 (VAG/VAD normalizado)." },
      { sim: "P", nombre: "Probabilidad", desc: "Nivel 1–5 de la amenaza (de F_PERT)." },
      { sim: "D", nombre: "Degradación", desc: "Factor 0.2–1.0 de la vulnerabilidad." },
      { sim: "RI", nombre: "Riesgo inherente", desc: "Magnitud del riesgo sin controles." },
    ],
    fuente: "VA viene del inventario (Fase 2), P de la amenaza y D de la vulnerabilidad asociadas al escenario.",
  },
  {
    id: "rr",
    fase: "Fase 4 · Valoración",
    titulo: "Riesgo Residual (RR)",
    formula: "RR = RI × FRC = VA × P × D × FRC",
    descripcion:
      "Riesgo que permanece después de aplicar los controles existentes. Es el valor que se compara contra los criterios de aceptación de la Fase 1.",
    variables: [
      { sim: "RI", nombre: "Riesgo inherente", desc: "VA × P × D." },
      { sim: "FRC", nombre: "Factor de reducción del control", desc: "0.3–1.0 según el estado del control." },
      { sim: "RR", nombre: "Riesgo residual", desc: "Posicionado en la matriz 5×5 y clasificado por nivel." },
    ],
    fuente: "En la matriz de calor RR se aproxima como P × I para posicionar el escenario.",
  },
  {
    id: "nivelRR",
    fase: "Fase 4 · Valoración",
    titulo: "Clasificación del nivel de riesgo",
    formula: "Nivel(RR): ≥20 Crítico · ≥12 Alto · ≥6 Medio · <6 Bajo",
    descripcion:
      "Traduce el RR numérico a una categoría para priorizar el tratamiento y aplicar los criterios de aceptación.",
    variables: [
      { sim: "RR", nombre: "Riesgo residual", desc: "Valor numérico del riesgo tras controles." },
    ],
    fuente: "Umbrales de la matriz de riesgo 5×5 (§4.4.2).",
  },
];

// --- Monte Carlo: fórmulas de la simulación (Fase 4 · §6.4 / §6.5) -----------
export const FORMULAS_MONTECARLO = [
  {
    id: "mc-betapert",
    titulo: "Muestreo Beta-PERT de cada variable",
    formula: "α = 1 + 4·(m − o)/(p − o)   ·   β = 1 + 4·(p − m)/(p − o)\nX = o + Beta(α, β)·(p − o)",
    descripcion:
      "En cada iteración se sortea un valor aleatorio de una distribución Beta-PERT definida por el triple (optimista o, más probable m, pesimista p). Así la simulación respeta la incertidumbre del experto en lugar de usar un único número.",
    variables: [
      { sim: "o", nombre: "Optimista", desc: "Cota mínima del triple (frecuencia o pérdida)." },
      { sim: "m", nombre: "Más probable", desc: "Moda del triple — el valor más esperado." },
      { sim: "p", nombre: "Pesimista", desc: "Cota máxima del triple." },
      { sim: "α, β", nombre: "Parámetros Beta", desc: "Definen la forma de la curva; concentran masa alrededor de m." },
    ],
    fuente: "El triple (o, m, p) lo provee el analista: la frecuencia desde el escenario y la pérdida desde la tabla LM por impacto.",
  },
  {
    id: "mc-tef",
    titulo: "Frecuencia simulada (TEF_j)",
    formula: "TEF_j = BetaPERT(freq_o, freq_mp, freq_p)",
    descripcion:
      "Número de veces/año que ocurre el evento en la iteración j. Se muestrea del triple de frecuencia del escenario.",
    variables: [
      { sim: "freq_o / freq_mp / freq_p", nombre: "Triple de frecuencia", desc: "Eventos/año optimista, más probable y pesimista del escenario." },
      { sim: "TEF_j", nombre: "Frecuencia de la iteración", desc: "Muestra aleatoria de eventos/año." },
    ],
    fuente: "Campos freq_o, freq_mp, freq_p del escenario (Fase 3, derivados de F_PERT de las amenazas).",
  },
  {
    id: "mc-lm",
    titulo: "Magnitud de pérdida simulada (LM_j)",
    formula: "LM_j = BetaPERT(LM_min, LM_esp, LM_max) × FRC",
    descripcion:
      "Pérdida económica (USD) de un único evento en la iteración j. El triple de pérdida depende del nivel de impacto I del escenario (tabla LM por impacto) y se atenúa con el FRC de los controles.",
    variables: [
      { sim: "LM_min / LM_esp / LM_max", nombre: "Triple de pérdida (USD)", desc: "Pérdida mínima, esperada y máxima según el impacto I (tabla §6.4)." },
      { sim: "I", nombre: "Nivel de impacto", desc: "1–5 = máx(C, I, D) del activo; selecciona la fila de la tabla LM." },
      { sim: "FRC", nombre: "Factor de reducción", desc: "Reduce la pérdida según los controles existentes." },
      { sim: "LM_j", nombre: "Pérdida de la iteración", desc: "USD perdidos por un evento en esa iteración." },
    ],
    fuente: "Tabla LM por impacto (LOSS_BY_I, §6.4). El nivel I y el FRC vienen del escenario.",
  },
  {
    id: "mc-ale",
    titulo: "Pérdida Anual Esperada por iteración (ALE_j)",
    formula: "ALE_j = TEF_j × LM_j",
    descripcion:
      "Pérdida anual de la iteración j: frecuencia anual × pérdida por evento. Se repite N veces (1.000–50.000) para construir la distribución de pérdidas.",
    variables: [
      { sim: "TEF_j", nombre: "Frecuencia simulada", desc: "Eventos/año de la iteración." },
      { sim: "LM_j", nombre: "Pérdida por evento", desc: "USD por evento (ya incluye FRC)." },
      { sim: "N", nombre: "Iteraciones", desc: "Cantidad de simulaciones (1.000 / 10.000 / 50.000)." },
    ],
    fuente: "Se genera internamente combinando TEF_j y LM_j en cada una de las N iteraciones.",
  },
  {
    id: "mc-resultados",
    titulo: "Resultados de la distribución",
    formula: "ALE = media(ALE_j)   ·   P90 = percentil_90   ·   P95 = percentil_95",
    descripcion:
      "Sobre las N pérdidas simuladas se reportan la media (pérdida esperada del año) y los percentiles P90/P95 (escenarios adversos para reservas/seguros). P(>$200K) es la probabilidad de exceder el umbral de aceptación.",
    variables: [
      { sim: "ALE (media)", nombre: "Pérdida anual esperada", desc: "Promedio de las N iteraciones — el valor central." },
      { sim: "P90 / P95", nombre: "Percentiles de cola", desc: "Pérdida que no se supera el 90% / 95% del tiempo." },
      { sim: "P(>$200K)", nombre: "Prob. de excedencia", desc: "% de iteraciones que superan el umbral de aceptación ($200K)." },
    ],
    fuente: "Estadística calculada sobre el vector ordenado de las N pérdidas ALE_j.",
  },
];

// Tabla de Magnitud de Pérdida por nivel de impacto I (USD · §6.4)
// Debe coincidir con LOSS_BY_I del backend (apps/riesgos/models.py).
export const LM_POR_IMPACTO = [
  { i: 1, min: 0, esp: 400, max: 1200, desc: "Impacto mínimo / molestia operativa" },
  { i: 2, min: 800, esp: 4500, max: 12000, desc: "Impacto bajo localizado" },
  { i: 3, min: 8000, esp: 40000, max: 110000, desc: "Impacto moderado en procesos" },
  { i: 4, min: 80000, esp: 200000, max: 550000, desc: "Impacto alto / multas LOPDP" },
  { i: 5, min: 300000, esp: 550000, max: 1100000, desc: "Impacto crítico / paralización clínica" },
];

// =============================================================================
// FASE 1 · ESTABLECIMIENTO DEL CONTEXTO (ISO 27005 cláusula 5)
// =============================================================================

// Alcance y límites de la evaluación (§ contexto)
export const ALCANCE = {
  incluye: [
    "Sistemas de información clínica (HCE, SGM, laboratorio, imagenología).",
    "Infraestructura tecnológica propia y en nube que procesa datos de salud.",
    "Procesos de negocio core: atención médica, agendamiento, facturación.",
    "Datos personales y datos personales especiales (salud) — LOPDP Art. 5.",
    "Identidades, accesos privilegiados y terceros/proveedores críticos.",
  ],
  excluye: [
    "Sedes o filiales no conectadas a la red corporativa.",
    "Activos personales de pacientes fuera del control de Medisalud.",
    "Riesgos puramente físicos sin componente de información.",
  ],
};

// Criterios de evaluación del riesgo (cómo se mide)
export const CRITERIOS_EVALUACION = [
  { criterio: "Probabilidad", base: "Frecuencia anualizada (TEF) con Beta-PERT", escala: "1–5 (F_PERT → §4.3)" },
  { criterio: "Impacto", base: "Pérdida económica en USD por dimensión CIA + legal/operativo/económico", escala: "1–5 (anclas USD §5.1.5)" },
  { criterio: "Riesgo inherente", base: "RI = VA × P × D", escala: "Cualitativo 1–25 + ALE en USD" },
  { criterio: "Riesgo residual", base: "RR = RI × FRC", escala: "Matriz 5×5 + ALE/P90 Monte Carlo" },
];

// Criterios de ACEPTACIÓN del riesgo (umbrales de decisión)
export const CRITERIOS_ACEPTACION = [
  { nivel: "Crítico", rango: "RR ≥ 20", decision: "No aceptable — tratamiento inmediato", accion: "Mitigar o transferir antes de 30 días. Escala a Dirección.", color: "Crítico" },
  { nivel: "Alto", rango: "RR 12 – 19", decision: "No aceptable — requiere tratamiento", accion: "Plan de tratamiento formal en el trimestre. Aprobación CISO.", color: "Alto" },
  { nivel: "Medio", rango: "RR 6 – 11", decision: "Aceptable bajo monitoreo", accion: "Aceptación documentada + monitoreo continuo de KPIs.", color: "Medio" },
  { nivel: "Bajo", rango: "RR < 6", decision: "Aceptable", accion: "Aceptar y registrar. Revisión anual.", color: "Bajo" },
];

// Apetito y tolerancia al riesgo (umbrales cuantitativos)
export const APETITO_RIESGO = [
  { metrica: "Umbral de pérdida por escenario (ALE)", valor: "$200,000 / año", desc: "Pérdida anual esperada máxima tolerada por escenario individual." },
  { metrica: "Apetito de riesgo residual", valor: "RR ≤ 6 (Bajo)", desc: "Nivel de riesgo que la organización acepta sin tratamiento adicional." },
  { metrica: "Tolerancia P90", valor: "≤ $500,000", desc: "Pérdida en el percentil 90 que activa revisión de reservas/seguro." },
  { metrica: "Datos de salud (LOPDP)", valor: "Tolerancia cero a brechas", desc: "Cualquier brecha de datos especiales exige notificación a la SPDP en 72h." },
];

// Criterios de clasificación de activos (§5.1.3) — escala NC-1…NC-5.
// La clasificación se deriva del NC ya calculado a partir del VA.
export const CLASIFICACION_NC = {
  "NC-1": {
    nombre: "Público", color: "bg-green-100 text-green-800 border-green-300",
    criterio: "Información aprobada para divulgación externa, cuyo acceso no genera afectación significativa para la organización.",
    aspectos: "Baja confidencialidad, bajo impacto operativo, bajo valor económico, sin restricciones legales relevantes y exposición permitida.",
    controles: "Revisión antes de publicación, control de versiones, validación de integridad y responsable de aprobación.",
  },
  "NC-2": {
    nombre: "Uso interno", color: "bg-lime-100 text-lime-800 border-lime-300",
    criterio: "Activos utilizados dentro de la organización, cuyo acceso debe limitarse a colaboradores autorizados. Su divulgación no autorizada podría generar impactos menores o moderados.",
    aspectos: "Información operativa interna, documentación de procesos, manuales, reportes internos y activos de soporte de bajo riesgo.",
    controles: "Gestión de identidades, control de accesos, segregación de funciones, capacitación, políticas de uso aceptable y respaldos básicos.",
  },
  "NC-3": {
    nombre: "Confidencial", color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    criterio: "Activos cuyo acceso está restringido a áreas, roles o responsables específicos. Su divulgación, alteración o pérdida podría causar daño significativo a la operación, cumplimiento o reputación.",
    aspectos: "Datos personales, información financiera, contratos, configuraciones técnicas, reportes sensibles y bases de datos internas.",
    controles: "Control de acceso basado en roles, cifrado en tránsito y reposo, autenticación multifactor, monitoreo de accesos, DLP y registro de auditoría.",
  },
  "NC-4": {
    nombre: "Restringido / Crítico", color: "bg-orange-100 text-orange-800 border-orange-300",
    criterio: "Activos cuyo compromiso podría afectar gravemente la continuidad operativa, generar pérdidas económicas importantes, incumplimientos legales o impacto reputacional alto.",
    aspectos: "Alta confidencialidad y disponibilidad, alto valor operativo y económico, datos sensibles o sistemas esenciales para procesos críticos.",
    controles: "Cifrado fuerte, MFA obligatoria, acceso mínimo necesario, revisión periódica de permisos, monitoreo continuo, respaldos protegidos, pruebas de recuperación y gestión estricta de cambios.",
  },
  "NC-5": {
    nombre: "Crítico / Estratégico", color: "bg-red-100 text-red-800 border-red-300",
    criterio: "Activo crítico para la misión clínica o estratégica. Procesa datos de categoría especial (salud, LOPDP Art. 5); su compromiso causa paralización total, multa SPDP > $500K o demanda colectiva.",
    aspectos: "Datos de pacientes (historias clínicas, laboratorio, telemedicina), sistemas core. Sujeto a EIPD obligatoria (Art. 42) y notificación SPDP en 72h (Art. 38).",
    controles: "Cifrado AES-256, MFA, auditoría de accesos, backup diario offline probado, plan de respuesta a incidentes, segmentación de red y monitoreo continuo.",
  },
};

export function calcularVA(dims, formula) {
  const base =
    dims.dim_confidencialidad + dims.dim_integridad + dims.dim_disponibilidad +
    dims.dim_legal + dims.dim_operativo + dims.dim_economico;
  if (formula === "VAD") {
    const score = base + (dims.dim_exposicion || 1) + (dims.dim_sensibilidad || 1);
    let r;
    if (score >= 34) r = { va: 5, nivel: "Crítico", nc: "NC-5" };
    else if (score >= 25) r = { va: 4, nivel: "Alto", nc: "NC-4" };
    else if (score >= 16) r = { va: 3, nivel: "Medio", nc: "NC-3" };
    else r = { va: score >= 12 ? 2 : 1, nivel: "Bajo", nc: score >= 12 ? "NC-2" : "NC-1" };
    return { ...r, score };
  }
  let r;
  if (base >= 26) r = { va: 5, nivel: "Crítico", nc: "NC-5" };
  else if (base >= 19) r = { va: 4, nivel: "Alto", nc: "NC-4" };
  else if (base >= 12) r = { va: 3, nivel: "Medio", nc: "NC-3" };
  else r = { va: base >= 9 ? 2 : 1, nivel: "Bajo", nc: base >= 9 ? "NC-2" : "NC-1" };
  return { ...r, score: base };
}
