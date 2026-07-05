"""Prompts del sistema centralizados para el asistente IA (OpenAI / ChatGPT).

Cada función arma el prompt según el `tipo` de consulta que llega al proxy.
El frontend nunca construye prompts: solo envía datos estructurados.
"""

SYSTEM_BASE = (
    "Eres un asistente experto en ciberseguridad y gestión cuantitativa de "
    "riesgos para el sector salud, alineado con ISO/IEC 27005:2022, MAGERIT v3.0 "
    "y FAIR. Respondes en español, con cifras concretas y fuentes verificables."
)


def prompt_tef_contexto(payload):
    """Estimación de TEF concisa: solo O/MP/P, TEF_PERT y 1 línea de justificación."""
    amenaza = payload.get("amenaza_nombre", payload.get("amenaza", "—"))
    sector = payload.get("sector", "Salud privada")
    pais = payload.get("pais", "Ecuador")
    return f"""Estima la Frecuencia de Evento de Amenaza (TEF) anualizada para "{amenaza}"
en el sector {sector} de {pais} / LATAM (clínica privada mediana, ~18.500 pacientes).

Responde SOLO en este formato breve (sin introducción ni explicaciones largas):
O: <eventos/año optimista>
MP: <eventos/año más probable>
P: <eventos/año pesimista>
TEF_PERT: <(O+4·MP+P)/6>
Justificación: <una sola frase>
Fuente: <una fuente, ej. Verizon DBIR 2023>"""


def prompt_sugerencia_tratamiento(payload):
    """Plan de tratamiento sugerido a partir del escenario calculado."""
    g = lambda k, d="—": payload.get(k, d)
    return f"""Eres un consultor senior de ciberseguridad especializado en
la metodología ISO/IEC 27002:2022 y gestión de riesgos para el sector salud.

Se ha calculado el siguiente escenario de riesgo para Medisalud Integral S.A.
(clínica privada, Quito, Ecuador, 18,500 pacientes):

ESCENARIO:
- Activo afectado: {g('activo')} (VA={g('va')}, NC={g('nc')})
- Amenaza: {g('amenaza')} (TEF_PERT={g('tef_pert')}/año)
- Vulnerabilidad: {g('vulnerabilidad')} (D={g('d')})
- Control existente: {g('control')} (FRC={g('frc')})
- RI calculado: {g('ri')}
- RR calculado: {g('rr')} → Nivel: {g('nivel')}
- ALE_PERT: ${g('ale_pert')} USD
- ALE_P90 (Monte Carlo): ${g('ale_p90')} USD
- Dimensiones CIA afectadas: {g('cia_afectada')}
- Obligaciones LOPDP: {g('lopdp_aplica')}

CRITERIOS DE LA METODOLOGÍA:
- Si RR ≥ 20: tratamiento INMEDIATO obligatorio (< 30 días)
- Si RR 12-19: PTR en < 90 días con análisis costo-beneficio
- FRC actual={g('frc')} → si implementas el control → FRC objetivo=0.3
- Si costo_control > ALE_P50 para riesgo MEDIO: puede aceptarse con justificación

Por favor proporciona:

1. ESTRATEGIA RECOMENDADA: mitigar / transferir / aceptar / evitar
   (justifica por qué, considerando nivel {g('nivel')} y ALE de ${g('ale_pert')})

2. CONTROLES ISO 27002:2022 ESPECÍFICOS (máximo 5, priorizados):
   Para cada control indica:
   - Número y nombre del control ISO 27002
   - Medida técnica/organizativa concreta para Medisalud
   - FRC esperado tras implementación (0.3 o 0.6)
   - Costo estimado en USD/año (rango realista para Ecuador)
   - Reducción ALE esperada en USD

3. ANÁLISIS COSTO-BENEFICIO:
   - Inversión total estimada (USD/año)
   - Reducción ALE proyectada (USD/año)
   - ROI = reducción_ALE / costo_control
   - Plazo de implementación (días)

4. PARA EL INFORME EJECUTIVO (2-3 párrafos en lenguaje no técnico):
   Explica el riesgo y la recomendación como si se lo dijeras al Gerente
   General de Medisalud, sin jerga técnica. Menciona el impacto en USD
   y en los pacientes.

Responde en español. Todos los costos en USD."""


def prompt_informe_ejecutivo(payload):
    """Narrativa ejecutiva concisa en TEXTO PLANO (las tablas las arma el frontend)."""
    return f"""Redacta un informe ejecutivo BREVE de riesgos cibernéticos para Medisalud
Integral S.A. (clínica privada, Quito). Usa TEXTO PLANO (sin markdown ni tablas),
máximo 450 palabras, lenguaje no técnico para gerencia, con estas secciones cortas:
1) Resumen ejecutivo, 2) Hallazgos críticos, 3) Perfil de riesgo (exposición en USD),
4) Recomendaciones y hoja de ruta a 90 días, 5) Obligaciones LOPDP.

Datos del análisis: {payload}"""


def _prompt_informe_legacy(payload):
    datos = payload.get("datos_completos", payload)
    return f"""Eres un consultor experto en ciberseguridad para el sector salud.
Debes redactar un informe ejecutivo de gestión de riesgos cibernéticos para
Medisalud Integral S.A. destinado a la Gerencia General y al Directorio.

DATOS DEL ANÁLISIS:
{datos}

El informe debe estar en ESPAÑOL EJECUTIVO y seguir esta estructura:

# INFORME EJECUTIVO — GESTIÓN DE RIESGOS CIBERNÉTICOS
## Medisalud Integral S.A.

### 1. RESUMEN EJECUTIVO (máximo 200 palabras)
Perfil de riesgo actual, exposición económica total y urgencia de acción.
Sin términos técnicos: "pérdida potencial", "probabilidad de ocurrencia",
"protección de datos de pacientes".

### 2. HALLAZGOS CRÍTICOS
Lista los escenarios CRÍTICOS con descripción simple, pérdida potencial USD,
probabilidad estimada y plazo de acción.

### 3. PERFIL DE RIESGO DEL PORTAFOLIO
ALE total, ALE pesimista (P90), número de escenarios por nivel, activos más expuestos.

### 4. PLAN DE TRATAMIENTO RECOMENDADO
Para cada escenario CRÍTICO/ALTO: acción (sin tecnicismos), inversión USD,
beneficio esperado, responsable sugerido.

### 5. HOJA DE RUTA — PRÓXIMOS 90 DÍAS
Fase A (<30 días), Fase B (31-60), Fase C (61-90).

### 6. INVERSIÓN VS. PROTECCIÓN
Inversión total, reducción de exposición, ROI (Z:1).

### 7. OBLIGACIONES REGULATORIAS
LOPDP Ecuador Art. 38, 40 y 42 en términos simples; consecuencias de no actuar.

Tono profesional pero accesible. Cada sección máximo 3 párrafos.
Total máximo 1,500 palabras."""


def prompt_resumen_escenario(payload):
    """Resumen ejecutivo muy breve de UN escenario, texto plano."""
    return f"""Redacta en TEXTO PLANO un resumen ejecutivo MUY BREVE (máximo 110 palabras,
tono gerencial formal, sin markdown ni listas) del siguiente escenario de riesgo de
Medisalud Integral S.A. Incluye en prosa: situación, exposición económica y una
recomendación. Datos: {payload}"""


# Despachador: tipo de consulta -> función constructora del prompt
BUILDERS = {
    "tef_contexto": prompt_tef_contexto,
    "sugerencia_tratamiento": prompt_sugerencia_tratamiento,
    "informe_ejecutivo": prompt_informe_ejecutivo,
    "resumen_escenario": prompt_resumen_escenario,
}
