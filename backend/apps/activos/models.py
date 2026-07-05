from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class TipoActivo(models.Model):
    FORMULAS = [("VAG", "Valor Activo General (6 dimensiones)"),
                ("VAD", "Valor Activo Digital (8 dimensiones)")]

    codigo = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    ejemplos = models.TextField(blank=True)
    formula = models.CharField(max_length=3, choices=FORMULAS, default="VAG")
    dimensiones_extra = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Tipo de Activo"
        verbose_name_plural = "Tipos de Activo"

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class ProcesoNegocio(models.Model):
    NIVELES = [("critico", "Crítico"), ("alto", "Alto"),
               ("medio", "Medio"), ("bajo", "Bajo")]

    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE,
        related_name="procesos",
    )
    codigo = models.CharField(max_length=10)
    nombre = models.CharField(max_length=200)
    responsable = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    nivel_importancia = models.CharField(max_length=10, choices=NIVELES, default="medio")

    class Meta:
        verbose_name = "Proceso de Negocio"
        verbose_name_plural = "Procesos de Negocio"
        ordering = ["codigo"]

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


# --- Reglas de normalización (Fase 3 del documento) ---------------------------

def normalizar_vag(score):
    if score >= 26:
        return 5, "Crítico", "NC-5"
    if score >= 19:
        return 4, "Alto", "NC-4"
    if score >= 12:
        return 3, "Medio", "NC-3"
    if score >= 9:
        return 2, "Bajo", "NC-2"
    return 1, "Bajo", "NC-1"


def normalizar_vad(score):
    if score >= 34:
        return 5, "Crítico", "NC-5"
    if score >= 25:
        return 4, "Alto", "NC-4"
    if score >= 16:
        return 3, "Medio", "NC-3"
    if score >= 12:
        return 2, "Bajo", "NC-2"
    return 1, "Bajo", "NC-1"


CONTROLES_POR_NIVEL = {
    "Crítico": "Controles MA: MFA, cifrado AES-256, segmentación de red, backup "
               "diario offline probado, plan de respuesta a incidentes. Revisión "
               "trimestral. Notificación SPDP en 72h si implica datos personales.",
    "Alto": "Controles A: MFA en accesos principales, cifrado en tránsito TLS 1.2+, "
            "backup semanal probado, gestión de parches mensual, registro de accesos.",
    "Medio": "Controles M: contraseñas robustas, cifrado básico, backup quincenal, "
             "revisión semestral de permisos, antivirus actualizado.",
    "Bajo": "Controles MB/B: políticas básicas de acceso, registro en inventario, "
            "revisión anual de propietario y estado del activo.",
}


class Activo(models.Model):
    ESTADOS = [("activo", "Activo"), ("inactivo", "Inactivo"),
               ("en_revision", "En revisión")]

    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE,
        related_name="activos",
    )
    codigo = models.CharField(max_length=20)
    nombre = models.CharField(max_length=200)
    tipo = models.ForeignKey(TipoActivo, on_delete=models.PROTECT, related_name="activos")
    propietario = models.CharField(max_length=200, blank=True)
    custodio_tecnico = models.CharField(max_length=200, blank=True)
    ubicacion = models.CharField(max_length=200, blank=True)
    proceso_asociado = models.ForeignKey(
        ProcesoNegocio, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="activos",
    )
    estado = models.CharField(max_length=12, choices=ESTADOS, default="activo")
    procesa_datos_salud = models.BooleanField(
        default=False,
        help_text="Datos de salud = categoría especial LOPDP Art. 5 → C=5 automático",
    )

    _dim = dict(validators=[MinValueValidator(1), MaxValueValidator(5)])
    dim_confidencialidad = models.IntegerField(default=1, **_dim)
    dim_integridad = models.IntegerField(default=1, **_dim)
    dim_disponibilidad = models.IntegerField(default=1, **_dim)
    dim_legal = models.IntegerField(default=1, **_dim)
    dim_operativo = models.IntegerField(default=1, **_dim)
    dim_economico = models.IntegerField(default=1, **_dim)
    dim_exposicion = models.IntegerField(null=True, blank=True)
    dim_sensibilidad = models.IntegerField(null=True, blank=True)

    # Calculados
    vag_score = models.IntegerField(null=True, blank=True)
    vad_score = models.IntegerField(null=True, blank=True)
    va_normalizado = models.IntegerField(null=True, blank=True)
    nivel_criticidad = models.CharField(max_length=20, blank=True)
    clasificacion_nc = models.CharField(max_length=10, blank=True)  # derivada del VA (§5.1.8/12)
    # Clasificación §5.1.3 asignable por el evaluador (NC-1..NC-5). Si vacía, usa la derivada.
    clasificacion = models.CharField(max_length=6, blank=True)
    controles_minimos = models.TextField(blank=True)

    notas = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Activo"
        verbose_name_plural = "Activos"
        ordering = ["codigo"]

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    def calcular(self):
        # Regla LOPDP: datos de salud => C=5 (y Sen=5 si es archivo digital)
        if self.procesa_datos_salud:
            self.dim_confidencialidad = 5

        base = (
            self.dim_confidencialidad + self.dim_integridad + self.dim_disponibilidad
            + self.dim_legal + self.dim_operativo + self.dim_economico
        )

        if self.tipo and self.tipo.formula == "VAD":
            exp = self.dim_exposicion or 1
            sen = self.dim_sensibilidad or 1
            if self.procesa_datos_salud:
                sen = 5
                self.dim_sensibilidad = 5
            self.dim_exposicion = exp
            score = base + exp + sen
            self.vad_score = score
            self.vag_score = None
            va, nivel, nc = normalizar_vad(score)
        else:
            self.dim_exposicion = None
            self.dim_sensibilidad = None
            self.vag_score = base
            self.vad_score = None
            va, nivel, nc = normalizar_vag(base)

        self.va_normalizado = va
        self.nivel_criticidad = nivel
        self.clasificacion_nc = nc
        if not self.clasificacion:  # default a la derivada; el evaluador puede cambiarla
            self.clasificacion = nc
        self.controles_minimos = CONTROLES_POR_NIVEL.get(nivel, "")

    def save(self, *args, **kwargs):
        self.calcular()
        super().save(*args, **kwargs)
