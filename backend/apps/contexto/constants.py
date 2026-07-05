"""Parámetros FIJOS de la Fase 1 (Establecimiento del Contexto) para
Medisalud Integral S.A. Valores exactos del documento metodológico (PDF).

Son decisiones metodológicas documentadas, NO configuración del usuario.
La API los expone en solo lectura.
"""

# --- Sección 4.1 / 3 del PDF — Comprensión de la organización ----------------
ORGANIZACION_CONTEXTO = {
    "nombre": "Medisalud Integral S.A.",
    "sector": "Salud privada",
    "pais": "Ecuador",
    "ciudad": "Quito",
    "tipo": "Empresa privada mediana",
    "empleados": 85,
    "usuarios_sistemas": 62,
    "pacientes_registrados": 18500,
    "centros_atencion": "3 centros médicos + 1 oficina administrativa",
    "infraestructura": "SGM en cloud, PostgreSQL/MySQL, portal web, telemedicina",
    "regulaciones": [
        "LOPDP Ecuador (datos de salud = categoría especial Art. 5)",
        "RGLOPDP Art. 29–32",
        "MSP (Ministerio de Salud Pública)",
        "SRI (facturación electrónica)",
    ],
    "horizonte_evaluacion": "12 meses — año fiscal 2026",
    "enfoque_analisis": (
        "Cuantitativo determinístico: escala numérica 1–5 con anclas en USD, "
        "frecuencias anualizadas TEF (FAIR), estimación PERT de 3 puntos como "
        "insumo para Simulación de Monte Carlo"
    ),
    "responsables": {
        "evaluacion": "Gerente Administrativo",
        "seguridad": "Coordinador de TI",
        "cumplimiento": "Responsable de Protección de Datos",
    },
    "marcos_referencia": [
        {
            "marco": "ISO/IEC 27005:2022",
            "elemento": "Ciclo completo de gestión: contexto, evaluación, tratamiento, aceptación, comunicación y monitoreo",
            "aplicacion": "Estructura de fases, puntos de decisión y ejes transversales para todos los activos de Medisalud",
        },
        {
            "marco": "MAGERIT v3.0",
            "elemento": "Tipología de activos, dimensiones CIA+Legal+Ope+Eco, escala 1–5, fórmula RI = VA × P × D, catálogos de amenazas y vulnerabilidades",
            "aplicacion": "Modelo cuantitativo exclusivo para análisis y valoración del riesgo en todos los centros clínicos",
        },
        {
            "marco": "FAIR",
            "elemento": "Frecuencia anualizada de eventos de amenaza (TEF) y magnitud de pérdida en USD",
            "aplicacion": "Anclas cuantitativas para probabilidad e impacto económico sobre activos clínicos y administrativos",
        },
        {
            "marco": "PERT",
            "elemento": "Estimación de 3 puntos (Optimista, Más Probable, Pesimista) para probabilidad e impacto bajo incertidumbre",
            "aplicacion": "Cálculo de rangos de TEF y pérdida esperada como punto de partida determinístico; alimenta distribución Beta-PERT para Monte Carlo",
        },
        {
            "marco": "Guía SPDP Ecuador (Res. 2025-0003-R)",
            "elemento": "Análisis de riesgos y EIPD para tratamiento de datos personales de alto riesgo",
            "aplicacion": "Obligaciones LOPDP Art. 40, 42 y RGLOPDP Art. 29–32 aplicables a los datos clínicos de Medisalud",
        },
        {
            "marco": "NIST CSF 2.0 / CVE-CVSS v3.x",
            "elemento": "Identificación de activos, severidad técnica de vulnerabilidades, integración con NVD",
            "aplicacion": "Enriquecimiento del análisis con CVEs reales que afectan al SGM y portal web de Medisalud",
        },
        {
            "marco": "Simulación Monte Carlo",
            "elemento": "Modelado de incertidumbre con N≥10,000 iteraciones sobre distribuciones Beta-PERT",
            "aplicacion": "Motor central de cálculo para todos los escenarios (Fase 3): ALE, P90, P95, probabilidad de excedencia",
        },
    ],
}

# --- Sección 4.2 del PDF — Criterios de impacto CIA con anclas USD -----------
CRITERIOS_IMPACTO = [
    {
        "nivel": "MA",
        "valor": 5,
        "descriptor": "Muy Alto — Activo crítico para la misión clínica",
        "confidencialidad": {
            "descripcion": "Fuga masiva de historias clínicas; multa LOPDP > $500K; demanda colectiva de pacientes",
            "ancla_usd": "> $500,000",
        },
        "integridad": {
            "descripcion": "Alteración de diagnósticos o dosis médicas; consecuencias de vida/muerte; pérdida > $500K",
            "ancla_usd": "> $500,000",
        },
        "disponibilidad": {
            "descripcion": "Paralización total de atención > 24h; imposibilidad de operar los 3 centros",
            "ancla_usd": "> $500,000",
        },
        "color": "red",
        "pert_loss": {"optimista": 300000, "mas_probable": 550000, "pesimista": 1100000},
        "uso_mc": "Riesgo CRÍTICO — parada de emergencia",
    },
    {
        "nivel": "A",
        "valor": 4,
        "descriptor": "Alto — Activo esencial para procesos core",
        "confidencialidad": {
            "descripcion": "Fuga de datos de pacientes; pérdida $100K–$500K; notificación obligatoria a SPDP",
            "ancla_usd": "$100,000 – $500,000",
        },
        "integridad": {
            "descripcion": "Modificación de registros clínicos críticos; retrasos en diagnóstico; pérdida $100K–$500K",
            "ancla_usd": "$100,000 – $500,000",
        },
        "disponibilidad": {
            "descripcion": "Interrupción crítica 4–24h en atención o facturación; pérdida $100K–$500K",
            "ancla_usd": "$100,000 – $500,000",
        },
        "color": "orange",
        "pert_loss": {"optimista": 80000, "mas_probable": 200000, "pesimista": 550000},
        "uso_mc": "Tratamiento obligatorio < 90 días",
    },
    {
        "nivel": "M",
        "valor": 3,
        "descriptor": "Medio — Activo importante con impacto moderado",
        "confidencialidad": {
            "descripcion": "Exposición de datos administrativos internos; pérdida $10K–$100K",
            "ancla_usd": "$10,000 – $100,000",
        },
        "integridad": {
            "descripcion": "Errores en información operativa (citas, turnos); corrección costosa; pérdida $10K–$100K",
            "ancla_usd": "$10,000 – $100,000",
        },
        "disponibilidad": {
            "descripcion": "Degradación del servicio de agendamiento 1–4h; pérdida $10K–$100K",
            "ancla_usd": "$10,000 – $100,000",
        },
        "color": "yellow",
        "pert_loss": {"optimista": 8000, "mas_probable": 40000, "pesimista": 110000},
        "uso_mc": "Controles compensatorios documentados",
    },
    {
        "nivel": "B",
        "valor": 2,
        "descriptor": "Bajo — Activo de soporte con impacto limitado",
        "confidencialidad": {
            "descripcion": "Acceso no autorizado a información no sensible; pérdida $1K–$10K",
            "ancla_usd": "$1,000 – $10,000",
        },
        "integridad": {
            "descripcion": "Inconsistencias menores; reversibles sin costo alto; pérdida $1K–$10K",
            "ancla_usd": "$1,000 – $10,000",
        },
        "disponibilidad": {
            "descripcion": "Inconveniencia operativa < 1h; pérdida $1K–$10K",
            "ancla_usd": "$1,000 – $10,000",
        },
        "color": "green",
        "pert_loss": {"optimista": 800, "mas_probable": 4500, "pesimista": 12000},
        "uso_mc": "Aceptable con registro formal",
    },
    {
        "nivel": "MB",
        "valor": 1,
        "descriptor": "Muy Bajo — Impacto mínimo o prescindible",
        "confidencialidad": {
            "descripcion": "Sin impacto apreciable en confidencialidad de datos clínicos",
            "ancla_usd": "< $1,000",
        },
        "integridad": {
            "descripcion": "Sin impacto apreciable en integridad de registros médicos",
            "ancla_usd": "< $1,000",
        },
        "disponibilidad": {
            "descripcion": "Sin impacto apreciable en disponibilidad",
            "ancla_usd": "< $1,000",
        },
        "color": "gray",
        "pert_loss": {"optimista": 0, "mas_probable": 400, "pesimista": 1200},
        "uso_mc": "Registro anual y revisión",
    },
]

# --- Sección 4.3 del PDF — Criterios de probabilidad TEF (FAIR) + PERT --------
CRITERIOS_PROBABILIDAD = [
    {
        "nivel": "Muy Alta",
        "valor": 5,
        "descriptor": "Ocurrencia prácticamente segura; amenaza activa en Medisalud o sector salud",
        "tef_o": 39, "tef_mp": 52, "tef_p": 78,
        "tef_pert": 54.5,
        "rango_texto": "> 52/año (PERT ≈ 54.5/año)",
        "cuando_actualiza": "Amenaza activa confirmada en el sector",
        "color": "red",
        "lm_pert_usd": 550000,
        "distribucion_mc": "PERT(300K, 550K, 1.1M)",
    },
    {
        "nivel": "Alta",
        "valor": 4,
        "descriptor": "Incidentes recurrentes; amenaza presente en el sector salud ecuatoriano",
        "tef_o": 0.8, "tef_mp": 3, "tef_p": 12,
        "tef_pert": 3.9,
        "rango_texto": "1–12/año (PERT ≈ 3.9/año)",
        "cuando_actualiza": "Nuevo CVE crítico publicado en sistemas usados",
        "color": "orange",
        "lm_pert_usd": 200000,
        "distribucion_mc": "PERT(80K, 200K, 550K)",
    },
    {
        "nivel": "Media",
        "valor": 3,
        "descriptor": "Ha ocurrido en el sector en los últimos 3 años; explotable con cierta complejidad",
        "tef_o": 0.08, "tef_mp": 0.5, "tef_p": 1,
        "tef_pert": 0.51,
        "rango_texto": "0.1–1/año (PERT ≈ 0.51/año)",
        "cuando_actualiza": "Cambio en contexto o control parcial",
        "color": "yellow",
        "lm_pert_usd": 40000,
        "distribucion_mc": "PERT(8K, 40K, 110K)",
    },
    {
        "nivel": "Baja",
        "valor": 2,
        "descriptor": "Poco probable; requiere condiciones muy específicas; control implementado",
        "tef_o": 0.008, "tef_mp": 0.05, "tef_p": 0.1,
        "tef_pert": 0.051,
        "rango_texto": "0.01–0.1/año (PERT ≈ 0.051/año)",
        "cuando_actualiza": "Resultado inesperado en auditoría de controles",
        "color": "green",
        "lm_pert_usd": 4500,
        "distribucion_mc": "PERT(800, 4.5K, 12K)",
    },
    {
        "nivel": "Muy Baja",
        "valor": 1,
        "descriptor": "Teóricamente posible; control completamente efectivo; sin historial",
        "tef_o": 0.001, "tef_mp": 0.005, "tef_p": 0.01,
        "tef_pert": 0.005,
        "rango_texto": "< 0.01/año (PERT ≈ 0.005/año)",
        "cuando_actualiza": "Primera evaluación o sin cambios en el entorno",
        "color": "gray",
        "lm_pert_usd": 400,
        "distribucion_mc": "PERT(0, 400, 1.2K)",
    },
]

# --- Sección 4.4 del PDF — Criterios de aceptación del riesgo ----------------
CRITERIOS_ACEPTACION = [
    {
        "rango_min": 20, "rango_max": 25,
        "nivel": "CRÍTICO",
        "ale_p90_esperado": "> $200,000",
        "estado": "No aceptable bajo ninguna circunstancia",
        "respuesta": "Tratamiento inmediato obligatorio. Escalación a Gerencia General + Responsable de Protección de Datos. Notificación SPDP obligatoria en 72h si involucra datos de pacientes (LOPDP Art. 40 y 38).",
        "plazo": "Inmediato (< 30 días)",
        "color": "red",
    },
    {
        "rango_min": 12, "rango_max": 19,
        "nivel": "ALTO",
        "ale_p90_esperado": "$50,000 – $200,000",
        "estado": "No aceptable. Requiere plan de tratamiento formal aprobado por Gerencia Administrativa.",
        "respuesta": "Plan de Tratamiento de Riesgos (PTR) documentado con análisis costo-beneficio en USD. Controles priorizados con ROI calculado sobre ALE Monte Carlo. Revisión mensual por Coordinador de TI.",
        "plazo": "< 90 días",
        "color": "orange",
    },
    {
        "rango_min": 6, "rango_max": 11,
        "nivel": "MEDIO",
        "ale_p90_esperado": "$10,000 – $50,000",
        "estado": "Aceptable con controles compensatorios documentados y monitoreo activo.",
        "respuesta": "Si el costo del control supera el ALE_P50 de Monte Carlo, puede aceptarse con justificación documentada aprobada por Gerencia Administrativa (ISO 27005 flexibilidad). Revisión semestral.",
        "plazo": "Monitoreo semestral",
        "color": "yellow",
    },
    {
        "rango_min": 1, "rango_max": 5,
        "nivel": "BAJO",
        "ale_p90_esperado": "< $10,000",
        "estado": "Dentro del umbral de aceptación de Medisalud. Registrar y revisar anualmente.",
        "respuesta": "Si 5 o más riesgos bajos comparten el mismo vector de ataque sobre activos clínicos, elevar a MEDIO por efecto acumulativo (ISO 27005 §8.5).",
        "plazo": "Revisión anual",
        "color": "green",
    },
]

# --- Sección 4.4.2 del PDF — Mapa de calor 5×5 -------------------------------
# RR_simple = P × I  (posición visual en el mapa)
MAPA_CALOR = {
    "descripcion": "Cada celda P×I muestra el RR simplificado y su nivel de criticidad",
    "formula": "RR_simple = P × I, donde I = máx(Valor_C, Valor_I, Valor_D)",
    "celdas": [
        # [probabilidad, impacto, valor_rr, nivel]
        [5, 1, 5, "BAJO"], [5, 2, 10, "MEDIO"], [5, 3, 15, "ALTO"], [5, 4, 20, "CRÍTICO"], [5, 5, 25, "CRÍTICO"],
        [4, 1, 4, "BAJO"], [4, 2, 8, "MEDIO"], [4, 3, 12, "ALTO"], [4, 4, 16, "ALTO"], [4, 5, 20, "CRÍTICO"],
        [3, 1, 3, "BAJO"], [3, 2, 6, "MEDIO"], [3, 3, 9, "MEDIO"], [3, 4, 12, "ALTO"], [3, 5, 15, "ALTO"],
        [2, 1, 2, "BAJO"], [2, 2, 4, "BAJO"], [2, 3, 6, "MEDIO"], [2, 4, 8, "MEDIO"], [2, 5, 10, "MEDIO"],
        [1, 1, 1, "BAJO"], [1, 2, 2, "BAJO"], [1, 3, 3, "BAJO"], [1, 4, 4, "BAJO"], [1, 5, 5, "BAJO"],
    ],
    "leyenda_p": {
        5: "> 52/año", 4: "1–12/año", 3: "0.1–1/año", 2: "0.01–0.1/año", 1: "< 0.01/año",
    },
    "leyenda_i": {
        1: "MB ($0–1K)", 2: "B ($1K–10K)", 3: "M ($10K–100K)", 4: "A ($100K–500K)", 5: "MA (>$500K)",
    },
}

# --- Sección 6.2 del PDF — Fórmulas centrales del modelo ---------------------
FORMULAS = {
    "ri": {
        "expresion": "RI = VA × P × D",
        "nombre": "Riesgo Intrínseco",
        "descripcion": "Exposición inherente del activo antes de cualquier medida de mitigación",
        "variables": {
            "VA": "Valor del Activo (escala 1–5, normalizado desde VAG o VAD)",
            "P": "Probabilidad TEF_PERT (escala 1–5, frecuencia anualizada)",
            "D": "Degradación (fracción decimal: 0.20 / 0.40 / 0.60 / 0.80 / 1.00)",
        },
        "rango_resultado": "Escala 1–125",
        "uso_mc": "λ distribuido en PERT(F_O, F_MP, F_P)",
    },
    "rr": {
        "expresion": "RR = RI × FRC",
        "nombre": "Riesgo Residual",
        "descripcion": "Nivel de riesgo remanente tras aplicar los controles existentes",
        "variables": {
            "FRC": "Factor de Reducción del Control: 1.0 = sin control | 0.6 = parcial | 0.3 = implementado y auditado",
        },
        "uso": "Se compara contra tabla de umbrales de aceptación",
    },
    "ale_pert": {
        "expresion": "ALE_PERT = TEF_PERT × LM_PERT",
        "nombre": "Pérdida Anual Esperada (determinística)",
        "descripcion": "Pérdida anual esperada en USD usando valores PERT ponderados",
        "variables": {
            "TEF_PERT": "(F_O + 4×F_MP + F_P) / 6",
            "LM_PERT": "(LO + 4×LMP + LP) / 6",
        },
        "uso": "Base para análisis costo-beneficio de controles",
    },
    "tef_pert": {
        "expresion": "T_PERT = (T_O + 4×T_m + T_P) / 6",
        "nombre": "Fórmula PERT de tres puntos",
        "descripcion": "Aplica tanto para TEF (frecuencia) como para LM (magnitud de pérdida). Produce valor esperado ponderado que da mayor peso al escenario más probable.",
        "variables": {
            "T_O": "Estimación optimista (escenario más favorable)",
            "T_m": "Estimación más probable (mayor evidencia disponible)",
            "T_P": "Estimación pesimista (escenario menos favorable)",
        },
    },
    "rr_simple": {
        "expresion": "RR_simple = P × I",
        "nombre": "Riesgo Residual simplificado (mapa de calor)",
        "descripcion": "Para posición visual en matriz 5×5. I = máx(Valor_C, Valor_I, Valor_D) del activo.",
        "rango_resultado": "1–25",
    },
    "degradacion": {
        "expresion": "D ∈ {0.20, 0.40, 0.60, 0.80, 1.00}",
        "nombre": "Degradación",
        "descripcion": "Fracción del valor del activo que se pierde cuando la vulnerabilidad es explotada",
        "tabla": [
            {"severidad": "Muy Baja", "d": 0.20, "interpretacion": "Impacto mínimo"},
            {"severidad": "Baja", "d": 0.40, "interpretacion": "Pérdida parcial reversible"},
            {"severidad": "Media", "d": 0.60, "interpretacion": "Pérdida significativa"},
            {"severidad": "Alta", "d": 0.80, "interpretacion": "Pérdida grave del valor del activo"},
            {"severidad": "Muy Alta", "d": 1.00, "interpretacion": "Compromiso total del activo"},
        ],
    },
}
