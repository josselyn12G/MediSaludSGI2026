"""Carga los 8 escenarios de riesgo del PDF (§6.5) como EscenarioRiesgo (wizard),
enlazados por FK a activo/amenaza/vulnerabilidad/control y calculados con el
motor Monte Carlo. Idempotente."""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.activos.models import Activo
from apps.amenazas.models import Amenaza, Control, Vulnerabilidad
from apps.organizacion.models import Organizacion
from apps.riesgos.models import EscenarioRiesgo

# codigo, nombre, amenaza, vuln, control, (tef_o, tef_mp, tef_p), estrategia
ESCENARIOS = [
    ("ESC-01", "Ransomware en BD de pacientes", "A.1", "VP-01", "CTR-06", (0.8, 2.8, 6), "mitigar"),
    ("ESC-02", "Explotación CVE en SGM (SQL Injection)", "A.12", "VT-01", "CTR-01", (0.5, 1.4, 4), "mitigar"),
    ("ESC-03", "Brecha por phishing + credenciales", "A.3", "VO-02", "CTR-03", (3, 5, 9), "mitigar"),
    ("ESC-04", "Fuga intencionada por insider", "A.9", "VP-03", "CTR-04", (0.2, 0.55, 1.2), "mitigar"),
    ("ESC-05", "DDoS sobre portal y telemedicina", "A.5", "VT-05", "CTR-07", (0.3, 0.65, 1.3), "transferir"),
    ("ESC-06", "Fallo de backups + pérdida irrecuperable", "E.6", "VP-01", "CTR-06", (0.15, 0.4, 0.9), "mitigar"),
    ("ESC-07", "Error médico: ingreso incorrecto en SGM", "E.1", "VO-04", "CTR-09", (8, 15, 28), "aceptar"),
    ("ESC-08", "Compromiso de proveedor cloud (supply chain)", "A.7", "VO-06", "CTR-10", (0.08, 0.19, 0.45), "transferir"),
]


class Command(BaseCommand):
    help = "Carga los 8 escenarios del wizard (FK) y los calcula con Monte Carlo."

    @transaction.atomic
    def handle(self, *args, **options):
        org = Organizacion.objects.filter(nombre="Medisalud Integral S.A.").first()
        if not org:
            self.stdout.write(self.style.ERROR("Ejecuta primero seed_medisalud."))
            return

        activos = list(Activo.objects.filter(organizacion=org).order_by("-va_normalizado"))
        if not activos:
            self.stdout.write(self.style.ERROR("No hay activos. Ejecuta seed_medisalud."))
            return

        creados = 0
        for idx, (cod, nombre, am_cod, vu_cod, ct_cod, tef, estrategia) in enumerate(ESCENARIOS):
            amenaza = Amenaza.objects.filter(organizacion=org, id_magerit=am_cod).first()
            vuln = Vulnerabilidad.objects.filter(organizacion=org, id_vuln=vu_cod).first()
            control = Control.objects.filter(organizacion=org, id_control=ct_cod).first()
            if not (amenaza and vuln):
                self.stdout.write(self.style.WARNING(f"{cod}: faltan catálogos ({am_cod}/{vu_cod}); omitido."))
                continue
            activo = activos[idx % len(activos)]

            esc, _ = EscenarioRiesgo.objects.update_or_create(
                organizacion=org, codigo=cod,
                defaults=dict(
                    nombre=nombre, activo=activo, amenaza=amenaza, vulnerabilidad=vuln,
                    control_existente=control,
                    tef_o_analista=tef[0], tef_mp_analista=tef[1], tef_p_analista=tef[2],
                    justificacion_tef="Estimado a partir del catálogo MAGERIT y el histórico del sector salud.",
                    estrategia_tratamiento=estrategia, estado="evaluado",
                ),
            )
            esc.simulaciones.all().delete()
            esc.recalcular(n=10000)
            creados += 1

        self.stdout.write(self.style.SUCCESS(f"Escenarios de riesgo (wizard): {creados}"))
