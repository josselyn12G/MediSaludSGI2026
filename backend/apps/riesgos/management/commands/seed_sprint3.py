"""Carga escenarios de riesgo (§6.5), Plan de Tratamiento (§8.2) y KPIs (§9.2)."""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.monitoreo.models import KPI
from apps.organizacion.models import Organizacion
from apps.riesgos.models import Escenario
from apps.tratamiento.models import PlanTratamiento

# codigo, nombre, activos, p, i, d, frc, (f_o,f_mp,f_p), ale_pert, ale_p90
ESCENARIOS = [
    ("ESC-01", "Ransomware en BD de pacientes", "INF-001 / AD-003", 4, 5, 1.0, 1.0, (0.8, 2.8, 6), 1740000, 3100000),
    ("ESC-02", "Explotación CVE en SGM (SQL Injection + exfiltración)", "SW-001 / INF-001", 4, 5, 1.0, 1.0, (0.5, 1.4, 4), 965000, 1800000),
    ("ESC-03", "Brecha masiva por phishing + credenciales comprometidas", "IAM-001 / INF-002", 5, 4, 0.8, 0.6, (3, 5, 9), 764000, 1400000),
    ("ESC-04", "Fuga intencionada por insider / empleado descontento", "INF-001 / IAM-002", 3, 5, 0.6, 0.6, (0.2, 0.55, 1.2), 211000, 490000),
    ("ESC-05", "DDoS sobre portal de agendamiento y telemedicina", "SW-002 / SVC-002", 3, 4, 0.8, 0.6, (0.3, 0.65, 1.3), 98000, 220000),
    ("ESC-06", "Fallo de backups + pérdida irrecuperable de registros", "AD-003 / INF-001", 3, 5, 1.0, 1.0, (0.15, 0.4, 0.9), 253000, 580000),
    ("ESC-07", "Error médico: ingreso incorrecto de datos en SGM", "INF-002 / SW-001", 5, 2, 0.4, 0.6, (8, 15, 28), 47000, 95000),
    ("ESC-08", "Compromiso proveedor cloud (supply chain)", "TERC-003 / SVC-003", 2, 4, 0.6, 0.6, (0.08, 0.19, 0.45), 29000, 68000),
]

# escenario_codigo, nombre, rr, estrategia, controles, medidas, ale_actual, ale_objetivo
PLANES = [
    ("ESC-01", "Ransomware BD pacientes", 20, "mitigar", "CTR-05, CTR-06, CTR-07, CTR-08",
     "1. Cifrado AES-256 BD. 2. Backups offline probados cada 30 días (RPO<4h). 3. Segmentación VLANs. 4. Plan IR con simulacro semestral. 5. EDR en endpoints.", 1740000, 523000),
    ("ESC-02", "CVE / SQL Injection SGM", 20, "mitigar", "CTR-01, CTR-04, CTR-07",
     "1. Parches SGM y portal en <30 días. 2. WAF + validación SQL. 3. Privilegios mínimos. 4. Pentest anual. 5. Integración NVD-NIST.", 965000, 290000),
    ("ESC-03", "Phishing + credenciales SGM", 20, "mitigar", "CTR-02, CTR-03, CTR-09",
     "1. MFA obligatorio SGM/VPN/correo. 2. Simulacros phishing trimestrales. 3. Contraseñas ≥14 + gestor. 4. SIEM logins anómalos. 5. ZTNA.", 764000, 229000),
    ("ESC-04", "Insider / fuga datos", 15, "mitigar", "CTR-04, CTR-10, VP-03",
     "1. DLP en correo y endpoints. 2. Offboarding <24h. 3. Revisión accesos IAM trimestral. 4. EIPD. 5. Logs de acceso clínico >90 días.", 211000, 63000),
    ("ESC-05", "DDoS portal / telemedicina", 12, "transferir", "CTR-07, CTR-08, SVC-002",
     "1. CDN/Anti-DDoS gestionado. 2. Ciberseguro DDoS. 3. BCP con failover. 4. IDS/IPS perimetral. 5. SLA uptime ≥99.5%.", 98000, 29000),
    ("ESC-06", "Fallo backups irrecuperable", 15, "mitigar", "CTR-06, CTR-08",
     "1. Backups 3-2-1 cifrados + prueba mensual. 2. RPO<4h / RTO<8h. 3. BCP con runbook. 4. Alerta automática si backup falla.", 253000, 76000),
    ("ESC-07", "Error médico datos SGM", 10, "aceptar", "CTR-09, VT-08",
     "1. Validación clínica doble en datos críticos. 2. Capacitación SGM semestral. 3. Auditoría de logs de modificación. 4. Aceptar con registro si ALE_P50<$23K.", 47000, 19000),
    ("ESC-08", "Compromiso supply chain", 8, "transferir", "CTR-10, VO-06",
     "1. NDA + cláusula seguridad en contratos. 2. EIPD para terceros. 3. Auditoría anual a proveedores cloud. 4. SBOM de software.", 29000, 9000),
]

# codigo, nombre, formula, linea_base, meta, umbral, frecuencia, responsable
KPIS = [
    ("KPI-01", "ALE total portafolio (USD)", "Σ ALE_PERT escenarios activos", "~$4.11M", "≤$1.24M", "Alerta si ALE aumenta >15% vs mes anterior", "Mensual", "Coordinador TI + Gerencia"),
    ("KPI-02", "Riesgos CRÍTICOS abiertos", "Conteo escenarios RR≥20 sin plan aprobado", "3 abiertos", "0", "Alerta inmediata si un CRÍTICO supera 30 días sin control", "Semanal", "Resp. Protección Datos"),
    ("KPI-03", "Tiempo promedio parches CVE críticos", "Promedio días desde NVD hasta parche en producción", ">60 días", "≤15 días", "Alerta si CVE CVSS≥9.0 sin parche supera 7 días", "Mensual", "Coordinador TI"),
    ("KPI-04", "Cobertura MFA en accesos críticos", "(Cuentas con MFA / Total cuentas críticas) × 100", "0%", "100%", "Alerta si cobertura cae por debajo del 95%", "Mensual", "Coordinador TI"),
    ("KPI-05", "Tasa éxito restauración backups", "(Pruebas exitosas / Pruebas totales) × 100", "Sin datos", "≥99%", "Alerta si alguna prueba falla o RPO/RTO no se cumple", "Mensual", "Coordinador TI"),
    ("KPI-06", "Tasa clic en simulacros phishing", "(Usuarios que hicieron clic / Total) × 100", ">35% estimado", "≤5%", "Alerta si supera 10% en 2 simulacros consecutivos", "Trimestral", "Resp. Protección Datos + RRHH"),
    ("KPI-07", "FRC promedio portafolio", "Promedio ponderado FRC por ALE de todos los escenarios", "0.87 (alto)", "≤0.45", "Alerta si FRC promedio sube 0.1 puntos vs trimestre", "Trimestral", "Coordinador TI"),
    ("KPI-08", "% controles implementados vs. planificados", "(Controles implementados / Total planificados) × 100", "30% (3/10)", "100%", "Alerta si avance mensual <10 puntos porcentuales", "Mensual", "Gerencia + Coordinador TI"),
    ("KPI-09", "MTTR incidentes de seguridad", "Tiempo promedio entre detección y resolución (horas)", "Sin BCP — >72h", "≤4h (CRÍTICO) / ≤24h (ALTO)", "Alerta si incidente CRÍTICO supera 2h sin equipo IR", "Por evento", "Coordinador TI + Gerencia"),
    ("KPI-10", "Variación TEF_PERT portafolio", "TEF_PERT(t) / TEF_PERT(t-1) por escenario y total", "Línea base Jun-2026", "Reducción ≥30% en ESC-01/02/03", "Alerta si TEF_PERT de ESC-01/02/03 aumenta vs trimestre previo", "Trimestral", "Resp. Protección Datos"),
]


class Command(BaseCommand):
    help = "Carga escenarios, plan de tratamiento y KPIs (idempotente)."

    @transaction.atomic
    def handle(self, *args, **options):
        org = Organizacion.objects.filter(nombre="Medisalud Integral S.A.").first()
        if not org:
            self.stdout.write(self.style.ERROR("Ejecuta primero seed_medisalud."))
            return

        for cod, nombre, activos, p, i, d, frc, freq, ale, p90 in ESCENARIOS:
            obj, _ = Escenario.objects.update_or_create(
                organizacion=org, codigo=cod,
                defaults=dict(nombre=nombre, activos=activos, p=p, i=i, d=d, frc=frc,
                              freq_o=freq[0], freq_mp=freq[1], freq_p=freq[2],
                              ale_pert=ale, ale_p90=p90),
            )
            obj.save()
        self.stdout.write(self.style.SUCCESS(f"Escenarios: {len(ESCENARIOS)}"))

        for cod, nombre, rr, estr, ctrl, med, aa, ao in PLANES:
            PlanTratamiento.objects.update_or_create(
                organizacion=org, escenario_codigo=cod,
                defaults=dict(escenario_nombre=nombre, rr=rr, estrategia=estr,
                              controles=ctrl, medidas=med, ale_actual=aa, ale_objetivo=ao),
            )
        self.stdout.write(self.style.SUCCESS(f"Planes de tratamiento: {len(PLANES)}"))

        for cod, nombre, formula, lb, meta, umbral, frec, resp in KPIS:
            KPI.objects.update_or_create(
                organizacion=org, codigo=cod,
                defaults=dict(nombre=nombre, formula=formula, linea_base=lb, meta=meta,
                              umbral_alerta=umbral, frecuencia=frec, responsable=resp),
            )
        self.stdout.write(self.style.SUCCESS(f"KPIs: {len(KPIS)}"))
        self.stdout.write(self.style.SUCCESS("Seed Sprint 3 completado."))
