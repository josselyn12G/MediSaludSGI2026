#!/bin/sh
set -e

echo "Waiting for database..."
if [ "$DB_ENGINE" = "postgres" ]; then
  while ! nc -z "$DB_HOST" "$DB_PORT"; do
    sleep 1
  done
  echo "Database is up."
fi

echo "Running makemigrations..."
python manage.py makemigrations accounts organizacion activos amenazas riesgos tratamiento monitoreo --noinput

echo "Running migrate..."
python manage.py migrate --noinput

echo "Seeding Medisalud data..."
python manage.py seed_medisalud

echo "Seeding catálogos de amenazas..."
python manage.py seed_amenazas

echo "Seeding escenarios, tratamiento y KPIs (Sprint 3)..."
python manage.py seed_sprint3

echo "Seeding escenarios del wizard (Sprint 2 · FK + Monte Carlo)..."
python manage.py seed_escenarios_wizard

echo "Seeding ciclo de monitoreo continuo (§9.1)..."
python manage.py seed_ciclo_monitoreo

echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
