# GRM · Medisalud Integral S.A.

Sistema web de **Gestión de Riesgos Cibernéticos** que digitaliza la metodología
cuantitativa basada en **ISO/IEC 27005:2022 · MAGERIT v3.0 · FAIR · PERT** para el
sector salud privado ecuatoriano (LOPDP).

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Django 4.2 + Django REST Framework + SimpleJWT |
| Frontend | React 18 + Vite + Tailwind CSS 3 + React Query + React Router + Recharts |
| Base de datos | PostgreSQL 16 |
| Orquestación | Docker Compose |

## Arranque con Docker (recomendado)

```bash
docker compose up --build
```

Esto levanta:
- **db**: PostgreSQL en `localhost:5432`
- **backend**: API Django en `http://localhost:8000` (corre migraciones + `seed_medisalud` automáticamente)
- **frontend**: App React en `http://localhost:5173`

Abre **http://localhost:5173**.

### Credenciales demo
```
admin@medisalud.com  /  medisalud2026
```
También puedes registrar una cuenta nueva desde `/registro`.

## Arranque manual (sin Docker)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations accounts organizacion activos amenazas riesgos tratamiento monitoreo
python manage.py migrate
python manage.py seed_medisalud
python manage.py runserver
```
(Sin la variable `DB_ENGINE=postgres` usa SQLite automáticamente.)

```bash
# Frontend
cd frontend
npm install
npm run dev
```

## Funcionalidad — Sprint 1

- **Landing page** pública, animada (partículas, parallax, contadores, hover/tilt) — temática ciberseguridad + salud (azul/blanco/cian).
- **Login y Registro** con JWT.
- **Dashboard** con estadísticas reales y gráficos (barras por tipo, dona por nivel).
- **Organización**: contexto ISO 27005, marco de referencia y procesos de negocio.
- **Inventario de Activos**: 33 activos precargados (inventario §2.5), filtros, búsqueda, CRUD.
  - Formulario con **sliders 1–5** y **cálculo de VA en tiempo real**.
  - **Escalas de calor** con anclas económicas (USD) bajo cada dimensión.
  - **Mapa de calor 5×5** dinámico que ubica el activo según P × I.
  - Tablas de referencia del documento (tipología, niveles de prioridad VAG/VAD).
- **Detalle de activo**: ficha, radar CIA, tabla de dimensiones con anclas USD, mapa de calor y controles mínimos.

### Metodología de valoración implementada
- `VAG = C+I+D+Legal+Ope+Eco` (rango 6–30) para activos generales.
- `VAD = VAG + Exp+Sen` (rango 8–40) para archivos digitales.
- Normalización a `VA (1–5)` y clasificación `NC-1…NC-5` según las tablas §5.1.8 / §5.1.10 / §5.1.12 / §5.1.13.
- Regla **LOPDP Art. 5**: activos con datos de salud → `C = 5` (y `Sen = 5` si es archivo digital) automáticamente.

## Estructura

```
grm-medisalud/
├── docker-compose.yml
├── backend/   (Django · apps: accounts, organizacion, activos, amenazas*, riesgos*, tratamiento*, monitoreo*)
└── frontend/  (React + Vite)
```
\* Apps creadas con modelos vacíos para los Sprints 2 y 3 (catálogos de amenazas, vulnerabilidades, escenarios, tratamiento y KPIs).

## API principal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/token/` | Login (email + password) |
| POST | `/api/auth/register/` | Registro |
| GET | `/api/auth/me/` | Usuario actual |
| GET/POST | `/api/activos/` | Lista / crea activos (VA calculado en backend) |
| GET/PUT/DELETE | `/api/activos/{id}/` | Detalle / editar / eliminar |
| GET | `/api/activos/stats/` | Estadísticas para el dashboard |
| GET | `/api/organizacion/` | Organización + marco de referencia |
| GET | `/api/procesos/` · `/api/tipos-activo/` | Catálogos de apoyo |
