"""Carga los datos de Medisalud Integral S.A. tomados del documento metodológico."""
from datetime import date

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.activos.models import Activo, ProcesoNegocio, TipoActivo
from apps.organizacion.models import MarcoReferencia, Organizacion

Usuario = get_user_model()

TIPOS = [
    ("INF", "Información / Datos", "VAG", False,
     "Activos de información en cualquier soporte o formato",
     "Bases de datos de pacientes, historias clínicas, resultados de laboratorio"),
    ("AD", "Archivos Digitales", "VAD", True,
     "Documentos o archivos almacenados en sistemas, endpoints, repositorios o nube",
     "PDF, DOCX, XLSX, CSV, SQL, ZIP, backups, imágenes, scripts"),
    ("SW", "Software / Aplicaciones", "VAG", False,
     "Aplicaciones, sistemas o plataformas utilizadas para operar procesos",
     "Sistema médico, portal de citas, facturación electrónica, telemedicina"),
    ("HW", "Hardware / Equipos", "VAG", False,
     "Equipos físicos que procesan, almacenan o transmiten información",
     "Firewall perimetral, servidor local, laptops de médicos"),
    ("SVC", "Servicios Tecnológicos", "VAG", False,
     "Servicios internos, externos o en la nube que soportan operaciones",
     "Correo corporativo, VPN, almacenamiento cloud, pasarela de pagos"),
    ("IAM", "Identidades y Accesos", "VAG", False,
     "Cuentas, credenciales y mecanismos de acceso",
     "Cuentas administrativas, cuenta DBA, credenciales API"),
    ("PER", "Personas / Roles Críticos", "VAG", False,
     "Personas con roles críticos o conocimiento especializado",
     "Administrador de base de datos, Responsable de protección de datos"),
    ("PRO", "Procesos de Negocio", "VAG", False,
     "Procesos clave del negocio",
     "Atención médica, agendamiento de citas, facturación y pagos"),
    ("REP", "Reputación e Imagen", "VAG", False,
     "Valor intangible asociado a confianza, marca e imagen institucional",
     "Sitio web institucional"),
    ("TERC", "Terceros / Proveedores", "VAG", False,
     "Proveedores externos críticos",
     "Proveedor de hosting, facturación electrónica, almacenamiento cloud"),
]

PROCESOS = [
    ("PC-01", "Gestión de historias clínicas", "Dirección Médica",
     "Registro, consulta y actualización de información médica de pacientes.", "critico"),
    ("PC-02", "Agendamiento de citas", "Coordinación de Atención al Cliente",
     "Reserva, modificación y cancelación de citas médicas.", "alto"),
    ("PC-03", "Laboratorio clínico", "Jefatura de Laboratorio",
     "Registro y entrega de resultados clínicos.", "critico"),
    ("PC-04", "Facturación y pagos", "Área Financiera",
     "Facturación electrónica, cobro y conciliación de pagos.", "alto"),
    ("PC-05", "Telemedicina", "Dirección Médica",
     "Atención médica remota mediante plataforma digital.", "alto"),
    ("PC-06", "Soporte tecnológico", "Coordinación de TI",
     "Administración de red, accesos, respaldos y sistemas.", "critico"),
    ("PC-07", "Gestión documental", "Administración",
     "Gestión de contratos, reportes, documentos internos y archivos.", "medio"),
]

MARCOS = [
    ("ISO/IEC 27005:2022",
     "Ciclo completo de gestión: contexto, evaluación, tratamiento, aceptación, comunicación y monitoreo",
     "Estructura de fases, puntos de decisión y ejes transversales para todos los activos de Medisalud"),
    ("MAGERIT v3.0",
     "Tipología de activos, dimensiones CIA+Legal+Ope+Eco, escala 1–5, fórmula RI = VA × P × D",
     "Modelo cuantitativo exclusivo para análisis y valoración del riesgo en todos los centros clínicos"),
    ("FAIR",
     "Frecuencia anualizada de eventos de amenaza (TEF) y magnitud de pérdida en USD",
     "Anclas cuantitativas para probabilidad e impacto económico sobre activos clínicos y administrativos"),
    ("PERT",
     "Estimación de 3 puntos (Optimista, Más Probable, Pesimista) para probabilidad e impacto",
     "Cálculo de rangos de TEF y de pérdida esperada que alimentan la distribución Beta-PERT en Monte Carlo"),
    ("Guía SPDP Ecuador (Res. 2025-0003-R)",
     "Análisis de riesgos y EIPD para tratamiento de datos personales de alto riesgo",
     "Obligaciones LOPDP Art. 40, 42 y RGLOPDP Art. 29–32 aplicables a los datos clínicos de Medisalud"),
    ("NIST CSF 2.0 / CVE-CVSS v3.x",
     "Identificación de activos, severidad técnica de vulnerabilidades, integración con NVD",
     "Enriquecimiento del análisis con CVEs reales que afectan al SGM y portal web de Medisalud"),
    ("Simulación Monte Carlo",
     "Modelado de incertidumbre con miles de iteraciones sobre distribuciones de frecuencia y pérdida",
     "Motor central de cálculo para todos los escenarios de riesgo (N≥10,000 iteraciones, ALE, P90, P95)"),
]

# codigo, nombre, tipo, propietario, custodio, ubicacion, proceso,
# (C, I, D, Legal, Ope, Eco[, Exp, Sen]), procesa_datos_salud
ACTIVOS = [
    ("INF001", "Base de datos de pacientes", "INF", "Dirección Médica", "DBA / TI", "Servidor cloud", "PC-01", (5, 5, 5, 5, 5, 5), True),
    ("INF002", "Historias clínicas digitales", "INF", "Dirección Médica", "Administrador sistema médico", "Sistema médico cloud", "PC-01", (5, 5, 5, 5, 4, 5), True),
    ("INF003", "Resultados de laboratorio", "INF", "Jefatura de Laboratorio", "Administrador laboratorio", "Sistema de laboratorio", "PC-03", (5, 5, 4, 5, 4, 4), True),
    ("INF004", "Datos de facturación", "INF", "Área Financiera", "Administrador financiero", "Sistema de facturación", "PC-04", (4, 5, 4, 4, 4, 4), False),
    ("AD001", "Reportes médicos en PDF", "AD", "Dirección Médica", "Usuarios médicos", "Repositorio cloud", "PC-01", (5, 4, 3, 4, 3, 3, 3, 5), True),
    ("AD002", "Archivo Excel de facturación mensual", "AD", "Área Financiera", "Analista financiero", "SharePoint / OneDrive", "PC-04", (4, 4, 3, 3, 3, 3, 4, 3), False),
    ("AD003", "Backups de base de datos clínica", "AD", "Coordinación de TI", "DBA", "Almacenamiento cloud", "PC-06", (5, 5, 5, 5, 4, 4, 2, 5), True),
    ("AD004", "Contratos con proveedores", "AD", "Administración", "Responsable administrativo", "Carpeta compartida cloud", "PC-07", (4, 3, 2, 4, 2, 3, 2, 3), False),
    ("SW001", "Sistema de gestión médica (SGM)", "SW", "Dirección Médica", "TI / Proveedor", "Cloud", "PC-01", (5, 5, 5, 5, 5, 5), True),
    ("SW002", "Portal web de citas", "SW", "Atención al Cliente", "Proveedor web / TI", "Hosting externo", "PC-02", (4, 4, 4, 3, 3, 3), False),
    ("SW003", "Sistema de laboratorio", "SW", "Jefatura de Laboratorio", "TI / Proveedor", "Servidor cloud", "PC-03", (5, 5, 4, 4, 4, 4), True),
    ("SW004", "Sistema de facturación electrónica", "SW", "Área Financiera", "Proveedor externo", "SaaS", "PC-04", (4, 4, 4, 4, 4, 4), False),
    ("SW005", "Plataforma de telemedicina", "SW", "Dirección Médica", "Proveedor externo", "SaaS", "PC-05", (5, 4, 4, 4, 4, 4), True),
    ("HW001", "Firewall perimetral", "HW", "Coordinación de TI", "Administrador de red", "Oficina principal", "PC-06", (4, 3, 5, 2, 4, 3), False),
    ("HW002", "Servidor local de archivos", "HW", "Coordinación de TI", "Administrador de sistemas", "Oficina principal", "PC-07", (4, 4, 4, 3, 4, 3), False),
    ("HW003", "Laptops de médicos", "HW", "Dirección Médica", "Soporte TI", "Centros médicos", "PC-01", (4, 3, 2, 3, 2, 2), False),
    ("HW004", "Equipos administrativos", "HW", "Administración", "Soporte TI", "Oficinas administrativas", "PC-07", (2, 2, 2, 2, 2, 2), False),
    ("SVC001", "Correo corporativo", "SVC", "Administración", "Proveedor cloud / TI", "Microsoft 365 / Google Workspace", "PC-07", (4, 3, 3, 3, 3, 3), False),
    ("SVC002", "VPN corporativa", "SVC", "Coordinación de TI", "Administrador de red", "Firewall / Cloud", "PC-06", (4, 3, 4, 3, 3, 3), False),
    ("SVC003", "Almacenamiento cloud", "SVC", "Coordinación de TI", "Proveedor cloud / TI", "Cloud", "PC-07", (4, 4, 4, 4, 4, 4), False),
    ("SVC004", "Pasarela de pagos", "SVC", "Área Financiera", "Proveedor externo", "Servicio externo", "PC-04", (4, 4, 3, 4, 4, 4), False),
    ("IAM001", "Cuentas administrativas del sistema médico", "IAM", "Dirección Médica", "TI", "Sistema médico", "PC-01", (5, 4, 3, 4, 4, 4), False),
    ("IAM002", "Cuenta DBA", "IAM", "Coordinación de TI", "DBA", "Base de datos cloud", "PC-06", (5, 5, 4, 4, 4, 5), False),
    ("IAM003", "Credenciales API de pasarela de pagos", "IAM", "Área Financiera", "TI / Proveedor", "Sistema de pagos", "PC-04", (5, 4, 3, 4, 4, 4), False),
    ("PER001", "Administrador de base de datos", "PER", "Coordinación de TI", "N/A", "Oficina principal", "PC-06", (4, 3, 3, 3, 4, 3), False),
    ("PER002", "Responsable de protección de datos", "PER", "Gerencia", "N/A", "Oficina principal", "PC-07", (3, 3, 2, 4, 3, 2), False),
    ("PRO001", "Atención médica", "PRO", "Dirección Médica", "Sistema médico", "Centros médicos", "PC-01", (4, 4, 5, 4, 5, 4), False),
    ("PRO002", "Agendamiento de citas", "PRO", "Atención al Cliente", "Portal web", "Web / Call center", "PC-02", (3, 3, 4, 2, 3, 3), False),
    ("PRO003", "Facturación y pagos", "PRO", "Área Financiera", "Sistema financiero", "SaaS / Cloud", "PC-04", (3, 4, 4, 4, 4, 4), False),
    ("REP001", "Sitio web institucional", "REP", "Marketing", "Proveedor web", "Hosting externo", "PC-07", (2, 3, 3, 2, 2, 3), False),
    ("TERC001", "Proveedor de hosting", "TERC", "Coordinación de TI", "Proveedor externo", "Cloud", "PC-02", (3, 3, 4, 3, 3, 3), False),
    ("TERC002", "Proveedor de facturación electrónica", "TERC", "Área Financiera", "Proveedor externo", "SaaS", "PC-04", (3, 3, 3, 4, 3, 3), False),
    ("TERC003", "Proveedor de almacenamiento cloud", "TERC", "Coordinación de TI", "Proveedor externo", "Cloud", "PC-06", (4, 3, 4, 4, 3, 4), False),
]


class Command(BaseCommand):
    help = "Carga los datos de Medisalud Integral S.A. (idempotente)."

    @transaction.atomic
    def handle(self, *args, **options):
        # Tipos de activo
        tipos = {}
        for codigo, nombre, formula, extra, desc, ejemplos in TIPOS:
            t, _ = TipoActivo.objects.update_or_create(
                codigo=codigo,
                defaults=dict(nombre=nombre, formula=formula,
                              dimensiones_extra=extra, descripcion=desc,
                              ejemplos=ejemplos),
            )
            tipos[codigo] = t
        self.stdout.write(self.style.SUCCESS(f"Tipos de activo: {len(tipos)}"))

        # Organización
        org, _ = Organizacion.objects.update_or_create(
            nombre="Medisalud Integral S.A.",
            defaults=dict(
                sector="Salud privada", pais="Ecuador", ciudad="Quito",
                tipo="Empresa privada mediana",
                num_empleados=85, num_usuarios_sistemas=62,
                num_pacientes_registrados=18500,
                centros_atencion="3 centros médicos y 1 oficina administrativa",
                modalidad_operacion="Atención presencial, laboratorio clínico, telemedicina y agendamiento web",
                responsable_evaluacion="Gerente Administrativo",
                responsable_seguridad="Coordinador de TI",
                responsable_cumplimiento="Responsable de Protección de Datos Personales",
                regulaciones_aplicables="LOPDP Ecuador (datos de salud = categoría especial Art. 5) · RGLOPDP Art. 29–32 · MSP · SRI",
                fecha_levantamiento=date(2026, 6, 1),
                horizonte_evaluacion_meses=12,
            ),
        )
        self.stdout.write(self.style.SUCCESS(f"Organización: {org.nombre}"))

        # Marcos de referencia
        org.marcos.all().delete()
        for i, (norma, elem, aplic) in enumerate(MARCOS):
            MarcoReferencia.objects.create(
                organizacion=org, norma=norma, elemento_incorporado=elem,
                aplicacion=aplic, orden=i,
            )
        self.stdout.write(self.style.SUCCESS(f"Marcos de referencia: {len(MARCOS)}"))

        # Procesos
        procesos = {}
        for codigo, nombre, resp, desc, nivel in PROCESOS:
            p, _ = ProcesoNegocio.objects.update_or_create(
                organizacion=org, codigo=codigo,
                defaults=dict(nombre=nombre, responsable=resp,
                              descripcion=desc, nivel_importancia=nivel),
            )
            procesos[codigo] = p
        self.stdout.write(self.style.SUCCESS(f"Procesos: {len(procesos)}"))

        # Activos
        for row in ACTIVOS:
            codigo, nombre, tipo_cod, prop, cust, ubic, proc_cod, dims, salud = row
            defaults = dict(
                organizacion=org, nombre=nombre, tipo=tipos[tipo_cod],
                propietario=prop, custodio_tecnico=cust, ubicacion=ubic,
                proceso_asociado=procesos.get(proc_cod), estado="activo",
                procesa_datos_salud=salud,
                dim_confidencialidad=dims[0], dim_integridad=dims[1],
                dim_disponibilidad=dims[2], dim_legal=dims[3],
                dim_operativo=dims[4], dim_economico=dims[5],
            )
            if len(dims) == 8:
                defaults["dim_exposicion"] = dims[6]
                defaults["dim_sensibilidad"] = dims[7]
            obj, created = Activo.objects.update_or_create(
                organizacion=org, codigo=codigo, defaults=defaults,
            )
            obj.save()  # recalcula scores
        self.stdout.write(self.style.SUCCESS(f"Activos: {len(ACTIVOS)}"))

        # Usuario demo
        if not Usuario.objects.filter(email="admin@medisalud.com").exists():
            Usuario.objects.create_superuser(
                email="admin@medisalud.com", password="medisalud2026",
                first_name="Administrador", last_name="Medisalud",
                rol="admin", organizacion=org,
            )
            self.stdout.write(self.style.SUCCESS(
                "Usuario demo: admin@medisalud.com / medisalud2026"))
        else:
            u = Usuario.objects.get(email="admin@medisalud.com")
            if not u.organizacion:
                u.organizacion = org
                u.save()

        self.stdout.write(self.style.SUCCESS("Seed completado."))
