# GRM · Medisalud Integral S.A.

Sistema web de **Gestión de Riesgos Cibernéticos** que digitaliza la metodología
cuantitativa basada en **ISO/IEC 27005:2022 · MAGERIT v3.0 · FAIR · PERT + Monte Carlo**
para el sector salud privado ecuatoriano (LOPDP).

> 📄 Documentación completa en [`docs/`](docs/): Manual de Usuario, Manual de
> Instalación, Documento de Respaldo Técnico y Presentación de módulos.

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Django 4.2 + Django REST Framework + SimpleJWT + NumPy (Monte Carlo) |
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 + React Query + React Router + Recharts |
| Base de datos | PostgreSQL 16 (Docker) · SQLite (desarrollo local) |
| Orquestación | Docker Compose |

## Requisitos

- **Con Docker**: solo Docker Desktop.
- **Sin Docker**: Python 3.12+ (probado en 3.13), Node.js 18+ (probado en 20) y Git.

---

## Opción A · Arranque con Docker (recomendado)

```bash
git clone https://github.com/josselyn12G/MediSaludSGI2026.git
cd MediSaludSGI2026
docker compose up --build
```

Esto levanta:
- **db**: PostgreSQL 16 en `localhost:5432`
- **backend**: API Django en `http://localhost:8000` — corre migraciones y **todos los seeds** automáticamente
- **frontend**: App React en `http://localhost:5173` — llama a `/api` y Vite lo reenvía al backend del compose

Abre **http://localhost:5173**.

## Opción B · Arranque manual (sin Docker)

**Terminal 1 — Backend (Django, puerto 8000):**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  ·  Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_medisalud            # organización + 33 activos
python manage.py seed_amenazas             # 34 amenazas · 21 vulnerabilidades · 10 controles
python manage.py seed_sprint3              # 8 escenarios · 8 planes · 10 KPIs
python manage.py seed_escenarios_wizard    # 8 escenarios del wizard (Monte Carlo)
python manage.py seed_ciclo_monitoreo      # ciclo de monitoreo §9.1
python manage.py runserver 0.0.0.0:8000
```

(Sin la variable `DB_ENGINE=postgres` usa **SQLite** automáticamente — no necesitas instalar base de datos.)

**Terminal 2 — Frontend (React/Vite, puerto 5173):**

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**.

> ⚠️ **Los 5 seeds son necesarios.** Si solo ejecutas `seed_medisalud`, los módulos de
> Amenazas, Vulnerabilidades, Controles, Riesgos, Tratamiento, Monitoreo y KPIs
> quedarán vacíos. Todos los seeds son idempotentes (pueden re-ejecutarse sin duplicar).

### Credenciales demo
```
admin@medisalud.com  /  medisalud2026
```
También puedes registrar una cuenta nueva desde `/registro`.

### Verificar que compila

```bash
cd backend && venv\Scripts\python.exe manage.py check    # System check: 0 issues
cd frontend && npm run build                             # vite build ✓
```

---

## Compartir en línea (ngrok)

Con backend y frontend corriendo localmente:

```bash
ngrok config add-authtoken TU_TOKEN   # una sola vez (token gratis en dashboard.ngrok.com)
ngrok http 5173
```

La URL pública `https://xxxx.ngrok-free.app` sirve todo (interfaz + API) por un solo
túnel, gracias al proxy `/api` del servidor Vite.

---

## Módulos del sistema

| Módulo | Fase ISO 27005 | Qué hace |
|--------|----------------|----------|
| **Dashboard** | — | Resumen ejecutivo: riesgos por nivel, ALE total USD, cobertura de tratamiento/monitoreo, catálogos y activos |
| **Organización / Contexto** | Fase 1 | Contexto institucional y parámetros fijos: escalas con anclas USD, criterios de aceptación, mapa 5×5, fórmulas y calculadora PERT |
| **Activos** | Fase 2 | Inventario con valoración multidimensional MAGERIT (sliders 1–5, VA en tiempo real, regla LOPDP C=5, tablas de referencia §5.1.5) |
| **Amenazas** | Fase 3 | Catálogo MAGERIT §5.2 (grupos N/I/E/A) con frecuencia PERT de 3 puntos → nivel P |
| **Vulnerabilidades** | Fase 3 | Catálogo §5.3 (VT/VO/VP): severidad → degradación D, con tabla de referencia con anclas USD |
| **Controles** | Fase 3 | Catálogo ISO 27002: estado → FRC (1.0/0.6/0.3) editable en línea |
| **Nuevo escenario** | Fases 3–4 | Wizard de 10 pasos con preselecciones automáticas, TEF justificado, Monte Carlo 10K iteraciones, priorización y tratamiento por escenario |
| **Riesgos** | Fase 4 | Portafolio consolidado: RR, nivel, ALE_PERT/P90, estrategia, fecha ordenable |
| **Tratamiento** | Fase 5 | Estrategias §8.1 (mitigar/transferir/aceptar/evitar) con controles propuestos y costos |
| **Monitoreo** | Fase 6 | Ciclo PDCA §9.1: frecuencia automática por nivel, plan por escenario con checklist de cumplimiento |
| **KPIs** | Fase 6 | 10 indicadores con fórmula, meta, umbral de alerta y responsable |
| **Informe ejecutivo** | Comunicación | Reporte para partes interesadas con narrativa IA y exportación a PDF |
| **Configuración IA** | — | API key del asistente (validación TEF y sugerencia de controles ISO 27002) |

## Metodología de valoración implementada

- `VAG = C+I+D+Legal+Ope+Eco` (6–30) · `VAD = VAG + Exp+Sen` (8–40) → `VA (1–5)` y `NC-1…NC-5`.
- Regla **LOPDP Art. 5**: activos con datos de salud → `C = 5` automático.
- `RI = VA×P×D` · `RR = RI×FRC` · `RR_simple = P×I` (mapa 5×5).
- `ALE` por simulación **Monte Carlo** (10.000 iteraciones Beta-PERT): media, P50, P90, P95 y P(ALE>$200K).
- Umbrales §4.4.1: Crítico RR≥20 (<30 días) · Alto 12–19 (<90 días) · Medio 6–11 (semestral) · Bajo (anual).
- Códigos `ESC-NN` autoasignados y frecuencia de monitoreo automática por nivel (§9.1).

## Estructura

```
MediSaludSGI2026/
├── docker-compose.yml
├── docs/                                (manuales, respaldo técnico y presentación)
├── backend/   (Django · apps: accounts, organizacion, contexto, activos, amenazas,
│               riesgos, tratamiento, monitoreo, ia_asistente · motor Monte Carlo)
└── frontend/  (React + Vite · pages, components, data/metodologia.js, api/resources.js)
```

## API principal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/token/` · `/api/auth/register/` | Login (JWT) y registro |
| GET/POST/PUT/DELETE | `/api/activos/` | Inventario (VA calculado en backend) · `/stats/` para el dashboard |
| GET/POST/… | `/api/amenazas/` · `/api/vulnerabilidades/` · `/api/controles/` | Catálogos Fase 3 (M2M reales) |
| GET/POST/PATCH | `/api/escenarios-riesgo/` | Escenarios del wizard · `/tef/`, `/calcular/`, `/tratamiento/` |
| GET/POST/PATCH/DELETE | `/api/tareas-monitoreo/` | Plan de monitoreo por escenario (checks) |
| GET | `/api/ciclos-monitoreo/` · `/api/kpis/` · `/api/contexto/` | Ciclo §9.1, indicadores y parámetros Fase 1 |
| POST | `/api/ia/consultar/` | Proxy del asistente IA (la key nunca se persiste) |

## Solución de problemas

- **`pip install` falla con psycopg2 en Python 3.13** → ya está fijado `psycopg2-binary==2.9.10` (tiene binarios para 3.13).
- **El asistente IA devuelve error de SSL/permisos** → algunos antivirus (Avast/AVG) interceptan HTTPS; el backend ya lo maneja (limpia `SSLKEYLOGFILE` y relaja `VERIFY_X509_STRICT` manteniendo la verificación).
- **Módulos vacíos (amenazas, riesgos, monitoreo…)** → faltan seeds; ejecuta los 5 comandos de la Opción B.
- **Puerto ocupado** → cambia el puerto (`runserver 0.0.0.0:8001` / `npm run dev -- --port 5174`) o cierra el proceso anterior.
