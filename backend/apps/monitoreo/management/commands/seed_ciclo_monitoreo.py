"""Carga el ciclo de monitoreo continuo (§9.1 del PDF). Idempotente."""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.monitoreo.models import CicloMonitoreo
from apps.organizacion.models import Organizacion

CICLOS = [
    ("Semanal", "CRÍTICO (RR≥20)",
     "Revisión estado controles CTR-03/06/08. Conteo KPI-02 (riesgos CRÍTICOS abiertos). "
     "Dashboard SIEM con alertas activas. Verificación notificaciones SPDP pendientes.",
     "Nuevo CVE CVSS≥9.0 en SGM o portal. Fallo de backup detectado. Incidente de seguridad "
     "en curso. Cambio en entorno regulatorio SPDP.",
     "Resp. Protección de Datos + Coordinador de TI"),
    ("Mensual", "ALTO (RR 12–19)",
     "Recálculo ALE_PERT con datos reales del mes. Prueba de restauración de backups. "
     "Revisión logs SIEM. Actualización KPIs 01-05 y 08. Informe a Gerencia Administrativa.",
     "ALE portafolio aumenta >15% vs. mes anterior. Tasa clic phishing >10%. Nuevo escenario "
     "de riesgo identificado. Cambio en infraestructura tecnológica.",
     "Coordinador de TI + Gerencia Administrativa"),
    ("Trimestral", "MEDIO (RR 6–11)",
     "Re-ejecución MC completa (N≥10K iteraciones) para todos los escenarios. Simulacro "
     "phishing trimestral. Revisión accesos IAM. Actualización FRC por controles "
     "implementados. Actualización KPIs 06-07 y 10.",
     "Implementación de nuevo control (FRC cambia). Resultado simulacro phishing fuera de "
     "meta. Auditoría externa con hallazgos críticos. TEF_PERT de ESC-01/02/03 aumenta "
     "respecto al trimestre previo.",
     "Resp. Protección de Datos + Coordinador de TI + Gerencia"),
    ("Anual", "BAJO (RR 1–5) + Revisión global",
     "Revisión completa del inventario de activos y catálogo de amenazas. Actualización de "
     "anclas USD por inflación del sector. Pen-test anual portal web. Re-calibración de "
     "todos los parámetros PERT con datos históricos de incidentes del año. Informe "
     "ejecutivo anual.",
     "Cambio de arquitectura cloud. Nuevo marco regulatorio Ecuador. Fusión o adquisición. "
     "Resultado pen-test con CVSS≥7.0 no previsto. Variación >20% en número de pacientes o "
     "empleados.",
     "Gerente Administrativo + Coordinador de TI + Resp. Protección de Datos + Dirección Médica"),
]


class Command(BaseCommand):
    help = "Carga el ciclo de monitoreo continuo (§9.1), idempotente."

    @transaction.atomic
    def handle(self, *args, **options):
        org = Organizacion.objects.filter(nombre="Medisalud Integral S.A.").first()
        if not org:
            self.stdout.write(self.style.ERROR("Ejecuta primero seed_medisalud."))
            return

        org.ciclos_monitoreo.all().delete()
        for i, (frec, nivel, act, disp, resp) in enumerate(CICLOS):
            CicloMonitoreo.objects.create(
                organizacion=org, frecuencia=frec, nivel_riesgo_aplicable=nivel,
                actividades=act, disparadores_reevaluacion=disp, responsable=resp, orden=i,
            )
        self.stdout.write(self.style.SUCCESS(f"Ciclo de monitoreo: {len(CICLOS)} filas"))
