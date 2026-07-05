"""Carga catálogos del Sprint 2: grupos, amenazas, vulnerabilidades y controles
(§5.2 / §5.3 / §5.4 del PDF). Idempotente. Estructura nueva con M2M."""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.activos.models import Activo
from apps.amenazas.models import Amenaza, Control, GrupoAmenaza, Vulnerabilidad
from apps.organizacion.models import Organizacion

# Mapa de los códigos abstractos del PDF (§5.2) a los códigos reales del inventario (§2.5)
ACTIVO_MAP = {
    "A-01": "INF001",  # Base de datos de pacientes
    "A-02": "SW001",   # Sistema de gestión médica (SGM)
    "A-03": "SW002",   # Portal web de citas
    "A-04": "HW002",   # Servidor local de archivos
    "A-05": "SVC002",  # VPN corporativa
    "A-06": "AD003",   # Backups de base de datos clínica
    "A-07": "SVC001",  # Correo corporativo
    "A-08": "IAM001",  # Cuentas administrativas
}

GRUPOS = [
    ("N", "Desastres Naturales", "Eventos de origen natural que afectan la infraestructura."),
    ("I", "De Origen Industrial", "Fallos de servicios, equipos o suministros."),
    ("E", "Errores y Fallos No Intencionados", "Errores humanos u operativos sin intención."),
    ("A", "Ataques Intencionados", "Acciones deliberadas de actores internos o externos."),
]
TIPO_POR_GRUPO = {"N": "natural", "I": "accidental", "E": "no_intencional", "A": "intencional"}
TIPO_POR_GRUPO_VULN = {"VT": "tecnologica", "VO": "organizacional", "VP": "proceso"}


def cia_flags(texto):
    t = [x.strip().upper() for x in texto.split(",")]
    return ("C" in t, "I" in t, "D" in t)


# grupo, codigo, nombre, descripcion, _tipo_legacy, f_o, f_mp, f_p, cia, activos, critica
AMENAZAS = [
    ("N", "N.1", "Fuego / Incendio", "Incendio en instalaciones de centros médicos", "", 0.01, 0.05, 0.2, "D", "A-04·A-02·A-01", False),
    ("N", "N.2", "Daños por agua / inundación", "Inundación en salas de servidores por lluvias intensas en Quito", "", 0.02, 0.1, 0.5, "D", "A-04·A-06", False),
    ("N", "N.3", "Sismo / Terremoto", "Terremoto que afecte la infraestructura física en Quito", "", 0.01, 0.03, 0.2, "D", "A-04·A-02", False),
    ("N", "N.4", "Fenómenos atmosféricos", "Rayos, granizo o tormentas que interrumpan el suministro eléctrico", "", 0.5, 2, 6, "D", "A-04·A-02·A-03", False),
    ("N", "N.5", "Contaminación ambiental", "Contaminación de laboratorio que afecte equipos conectados a red", "", 0.001, 0.01, 0.05, "D", "A-04", False),
    ("I", "I.1", "Fallo del suministro eléctrico", "Corte eléctrico que afecte servidores sin UPS adecuado", "", 2, 6, 24, "D", "A-04·A-02·A-01", False),
    ("I", "I.2", "Fallo de comunicaciones / conectividad", "Interrupción de internet o red interna que afecte portal y telemedicina", "", 3, 8, 24, "D", "A-03·A-05·A-07", False),
    ("I", "I.3", "Avería de hardware / equipos", "Fallo físico de servidores o equipos de red que afecten el SGM", "", 0.5, 2, 8, "D", "A-04·A-02", False),
    ("I", "I.4", "Avería de software / SO", "Fallo del SO o del SGM que impida acceso a historias clínicas", "", 1, 4, 12, "D,I", "A-02·A-01", False),
    ("I", "I.5", "Corte de suministro HVAC / UPS", "Fallo de climatización o UPS que causen daño térmico al servidor", "", 0.3, 1, 4, "D", "A-04", False),
    ("I", "I.6", "Contaminación electromagnética", "Interferencias que afecten equipos médicos o sistemas inalámbricos", "", 0.1, 0.5, 2, "D", "A-04·A-02", False),
    ("E", "E.1", "Error del usuario / médico", "Errores de ingreso de datos en el SGM por médicos o admisiones", "", 20, 52, 100, "I", "A-01·A-02", False),
    ("E", "E.2", "Error del administrador de sistemas", "Configuración errónea de servidor, firewall o políticas de acceso", "", 1, 4, 12, "C,I,D", "A-04·A-02·A-05", False),
    ("E", "E.3", "Error en mantenimiento / actualización", "Actualización fallida del SGM o parches que dejen el sistema inoperable", "", 0.5, 2, 6, "D,I", "A-02·A-04", False),
    ("E", "E.4", "Fuga de información accidental", "Envío accidental de historias clínicas a destinatario equivocado", "", 1, 6, 24, "C", "A-01·A-07", False),
    ("E", "E.5", "CVEs sin parchear no explotados", "CVEs sin parchear en SGM o portal web que aún no han sido explotados", "", 4, 12, 26, "C,I,D", "A-02·A-03·A-04", False),
    ("E", "E.6", "Destrucción accidental de información", "Eliminación accidental de registros clínicos o backups por error operativo", "", 0.2, 1, 4, "D,I", "A-01·A-06", False),
    ("E", "E.7", "Corrupción de datos", "Corrupción de BD de pacientes por error en migración o backup mal restaurado", "", 0.3, 1, 4, "I", "A-01·A-06", False),
    ("E", "E.8", "Error en configuración de accesos", "Permisos incorrectos en SGM que permiten acceso no autorizado a historias", "", 0.5, 2, 8, "C,I", "A-02·A-01", False),
    ("A", "A.1", "Ransomware / Cifrado malicioso", "Cifrado de BD de pacientes y SGM con exigencia de rescate; paralización total", "", 1, 3, 8, "D,C,I", "A-01·A-02·A-04·A-06", True),
    ("A", "A.2", "Acceso no autorizado / Intrusión", "Acceso ilegítimo a historias clínicas o módulos administrativos del SGM", "", 0.5, 2, 8, "C,I", "A-01·A-02·A-05", True),
    ("A", "A.3", "Phishing / Ingeniería social", "Correos falsos para robar credenciales del SGM o VPN de médicos/admin.", "", 12, 36, 78, "C,D", "A-07·A-08·A-02·A-05", True),
    ("A", "A.4", "Exfiltración / Fuga intencionada", "Robo deliberado de datos de pacientes por empleado interno o atacante externo", "", 0.3, 1, 4, "C", "A-01·A-06", True),
    ("A", "A.5", "DDoS — Denegación de servicio", "Ataque DDoS al portal web o VPN que impida agendamiento y telemedicina", "", 0.2, 1, 4, "D", "A-03·A-05", False),
    ("A", "A.6", "Explotación de CVE técnico", "Explotación activa de CVEs en SGM, portal o SO de servidores", "", 1, 4, 12, "C,I,D", "A-02·A-03·A-04", True),
    ("A", "A.7", "Ataque supply chain", "Compromiso de proveedor de software médico, laboratorio o cloud", "", 0.1, 0.5, 2, "C,I", "A-02·A-06", False),
    ("A", "A.8", "Suplantación de identidad (spoofing)", "Suplantación de médicos o administradores para acceder al portal o correo", "", 0.5, 2, 6, "C,I", "A-07·A-02·A-08", False),
    ("A", "A.9", "Abuso de privilegios / insider", "Empleado con acceso al SGM que usa privilegios para extraer datos", "", 0.2, 1, 4, "C,I", "A-01·A-02·A-08", True),
    ("A", "A.10", "Robo de dispositivos físicos", "Robo de laptops médicas o USBs con información de pacientes sin cifrado", "", 0.2, 0.5, 2, "C", "A-03·A-07", False),
    ("A", "A.11", "Manipulación de registros médicos", "Alteración deliberada de historias clínicas o resultados de laboratorio", "", 0.1, 0.3, 1, "I", "A-01·A-02", False),
    ("A", "A.12", "Inyección SQL / XSS en portal web", "Inyección SQL o XSS a la BD a través del portal de agendamiento", "", 1, 4, 12, "C,I", "A-03·A-01", True),
    ("A", "A.13", "Interceptación MITM", "Interceptación de sesiones de telemedicina sin cifrado TLS", "", 0.1, 0.5, 2, "C", "A-03·A-05", False),
    ("A", "A.14", "Destrucción intencionada de datos", "Eliminación deliberada de registros clínicos o backups por empleado descontento", "", 0.05, 0.2, 1, "D", "A-01·A-06", False),
    ("A", "A.15", "Repudio / Fraude en facturación", "Negación de transacciones en facturación electrónica o recetas digitales", "", 0.2, 1, 4, "I,Legal", "A-02·A-07", False),
]

# grupo(UI), codigo, nombre, descripcion, severidad, cia, amenazas_asociadas(codigos)
VULNERABILIDADES = [
    ("VT", "VT-01", "Software sin parchear", "SGM o portal sin actualizaciones; SO con CVEs activos", 5, "C,I,D", "A.3, A.6, E.5"),
    ("VT", "VT-02", "API del SGM sin autenticación", "Endpoints REST sin tokens ni validación de origen", 5, "C,I,D", "A.2, A.4, A.12"),
    ("VT", "VT-03", "Sin cifrado en tránsito", "Comunicaciones sin TLS 1.2+ en portal o telemedicina", 4, "C", "A.13, A.4"),
    ("VT", "VT-04", "Sin cifrado en reposo", "BD y backups sin cifrado AES-256", 4, "C", "A.1, A.4, A.10"),
    ("VT", "VT-05", "Red plana / sin VLANs", "Sin segmentación entre red clínica, admin. y servidores", 4, "C,D", "A.1, A.2, A.5"),
    ("VT", "VT-06", "Firewall mal configurado", "Reglas permisivas que exponen puertos del SGM a internet", 3, "C,D", "A.2, A.5, A.6"),
    ("VT", "VT-07", "Sin IDS/IPS", "Sin monitoreo automatizado de tráfico en los 3 centros", 3, "C,D", "A.1, A.2, A.3"),
    ("VT", "VT-08", "Logs de auditoría insuficientes", "Sin SIEM; retención < 90 días; sin alertas automáticas", 2, "C,I", "E.2, A.9, A.11"),
    ("VO", "VO-01", "Contraseñas débiles o compartidas", "Personal usando contraseñas simples en el SGM", 4, "C,I", "A.2, A.8, A.3"),
    ("VO", "VO-02", "Sin MFA en accesos críticos", "Sin MFA para SGM, portal admin. o VPN", 4, "C,I", "A.2, A.3, A.8"),
    ("VO", "VO-03", "Permisos excesivos", "Médicos con acceso a todos los registros sin restricción", 3, "C,I", "A.9, A.2, A.11"),
    ("VO", "VO-04", "Sin capacitación en ciberseguridad", "Personal sin formación en phishing o manejo de datos", 3, "C,I,D", "A.3, E.1, E.4"),
    ("VO", "VO-05", "Sin política BYOD", "Médicos acceden al SGM desde dispositivos personales sin MDM", 3, "C", "A.10, A.4"),
    ("VO", "VO-06", "Gestión inadecuada de proveedores", "Contratos sin NDA ni SLA de ciberseguridad", 3, "C,I", "A.7, A.4"),
    ("VO", "VO-07", "Sin BCP documentado", "Sin procedimientos de continuidad ante incidentes", 2, "D", "N.1, I.1, A.1"),
    ("VP", "VP-01", "Backups no probados", "Sin pruebas de restauración en últimos 6 meses; RPO/RTO indefinidos", 5, "D", "A.1, E.6, I.3"),
    ("VP", "VP-02", "Sin plan de respuesta a incidentes", "Sin procedimiento formal para equipos TI y clínicos", 3, "D", "A.1, A.2, N.1"),
    ("VP", "VP-03", "Offboarding insuficiente", "Accesos no revocados al finalizar contratos de personal", 3, "C,I", "A.9, A.2, A.4"),
    ("VP", "VP-04", "Sin revisión periódica de accesos", "Privilegios acumulados por cambios de rol sin revisión", 3, "C,I", "A.9, A.2"),
    ("VP", "VP-05", "Sin EIPD para nuevos procesos", "Módulos SGM implementados sin EIPD previa (LOPDP Art. 42)", 3, "C,Legal", "A.4, E.4"),
    ("VP", "VP-06", "Sin clasificación de activos", "Datos de pacientes sin etiquetado; sin DLP activo", 2, "C", "E.4, A.4, A.9"),
]

# codigo, nombre, iso_ref, estado, vulns_mitigadas(codigos), activos_protegidos
CONTROLES = [
    ("CTR-01", "Gestión de parches y actualizaciones", "8.8", "parcial", "VT-01, VT-02", "A-02, A-03, A-04"),
    ("CTR-02", "Política de contraseñas robustas", "5.17", "parcial", "VO-01", "A-02, A-05, A-07"),
    ("CTR-03", "Autenticación multifactor (MFA) en SGM y VPN", "8.5", "ausente", "VO-02, VO-01", "A-02, A-05, A-07, A-08"),
    ("CTR-04", "Privilegios mínimos y revisión semestral de accesos", "8.2 / 5.18", "parcial", "VO-03, VP-04", "A-01, A-02, A-08"),
    ("CTR-05", "Cifrado TLS 1.2+ en tránsito y AES-256 en reposo", "8.24", "parcial", "VT-03, VT-04", "A-01, A-03, A-06"),
    ("CTR-06", "Respaldos cifrados con prueba de restauración cada 90 días", "8.13", "ausente", "VP-01", "A-06, A-01"),
    ("CTR-07", "Segmentación de red con VLANs y firewalls perimetrales", "8.20 / 8.22", "parcial", "VT-05, VT-06", "A-04, A-02, A-03"),
    ("CTR-08", "Plan de respuesta a incidentes y simulacros anuales", "5.26 / 5.27", "ausente", "VP-02", "Todos"),
    ("CTR-09", "Capacitación anual en ciberseguridad", "6.3 / 6.8", "parcial", "VO-04", "A-07, A-08"),
    ("CTR-10", "EIPD para nuevos tratamientos de datos (LOPDP Art. 42)", "5.31 / LOPDP", "ausente", "VP-05", "A-01, A-02, A-03"),
]


class Command(BaseCommand):
    help = "Carga catálogos de amenazas, vulnerabilidades y controles (idempotente)."

    @transaction.atomic
    def handle(self, *args, **options):
        org = Organizacion.objects.filter(nombre="Medisalud Integral S.A.").first()
        if not org:
            self.stdout.write(self.style.ERROR("Ejecuta primero seed_medisalud."))
            return

        grupos = {}
        for cod, nombre, desc in GRUPOS:
            grupos[cod], _ = GrupoAmenaza.objects.update_or_create(
                codigo=cod, defaults=dict(nombre=nombre, descripcion=desc))

        for g, cod, nombre, desc, _t, fo, fmp, fp, cia, activos, crit in AMENAZAS:
            c, i, d = cia_flags(cia)
            obj, _ = Amenaza.objects.update_or_create(
                organizacion=org, id_magerit=cod,
                defaults=dict(grupo=grupos[g], nombre=nombre, descripcion_medisalud=desc,
                              tipo=TIPO_POR_GRUPO[g], tef_o=fo, tef_mp=fmp, tef_p=fp,
                              afecta_c=c, afecta_i=i, afecta_d=d, activos_tipicos=activos,
                              es_critica_lopdp=crit, precargada=True),
            )
            # Asocia los activos reales (mapeando los códigos abstractos A-0x del PDF)
            reales = [ACTIVO_MAP[x.strip()] for x in activos.split("·") if x.strip() in ACTIVO_MAP]
            obj.activos.set(Activo.objects.filter(organizacion=org, codigo__in=reales))
        self.stdout.write(self.style.SUCCESS(f"Amenazas: {len(AMENAZAS)}"))

        for g, cod, nombre, desc, sev, cia, amen in VULNERABILIDADES:
            c, i, d = cia_flags(cia)
            v, _ = Vulnerabilidad.objects.update_or_create(
                organizacion=org, id_vuln=cod,
                defaults=dict(nombre=nombre, descripcion_medisalud=desc,
                              tipo=TIPO_POR_GRUPO_VULN[g], severidad=sev,
                              afecta_c=c, afecta_i=i, afecta_d=d, precargada=True),
            )
            codigos = [x.strip() for x in amen.split(",") if x.strip()]
            v.amenazas_asociadas.set(
                Amenaza.objects.filter(organizacion=org, id_magerit__in=codigos))
        self.stdout.write(self.style.SUCCESS(f"Vulnerabilidades: {len(VULNERABILIDADES)}"))

        for cod, nombre, iso, estado, vulns, activos in CONTROLES:
            ctr, _ = Control.objects.update_or_create(
                organizacion=org, id_control=cod,
                defaults=dict(nombre=nombre, referencia_iso=iso, estado=estado,
                              activos_protegidos=activos, precargado=True),
            )
            codigos = [x.strip() for x in vulns.split(",") if x.strip()]
            ctr.vulnerabilidades_mitigadas.set(
                Vulnerabilidad.objects.filter(organizacion=org, id_vuln__in=codigos))
        self.stdout.write(self.style.SUCCESS(f"Controles: {len(CONTROLES)}"))
        self.stdout.write(self.style.SUCCESS("Seed amenazas completado."))
