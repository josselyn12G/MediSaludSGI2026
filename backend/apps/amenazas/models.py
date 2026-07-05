"""Catálogos Fase 2/3 — Amenazas, Vulnerabilidades y Controles.

Estructura del Sprint 2 (spec del PDF §5.2 / §5.3 / §5.4):
- GrupoAmenaza (N/I/E/A)
- Amenaza con TEF de tres puntos (O/MP/P) y banderas CIA
- Vulnerabilidad con severidad → degradación y M2M a amenazas
- Control con estado → FRC y M2M a vulnerabilidades mitigadas
"""
from django.db import models


def f_pert(o, mp, p):
    """Frecuencia esperada PERT: (O + 4·MP + P) / 6."""
    return round((o + 4 * mp + p) / 6, 3)


def nivel_probabilidad(fp):
    """Mapea TEF_PERT (eventos/año) al nivel ordinal P 1–5 (§4.3)."""
    if fp > 52:
        return 5
    if fp >= 1:
        return 4
    if fp >= 0.1:
        return 3
    if fp >= 0.01:
        return 2
    return 1


DEGRADACION_POR_SEVERIDAD = {5: 1.0, 4: 0.8, 3: 0.6, 2: 0.4, 1: 0.2}
FRC_POR_ESTADO = {"ausente": 1.0, "parcial": 0.6, "implementado": 0.3}


class GrupoAmenaza(models.Model):
    codigo = models.CharField(max_length=2, unique=True)  # N, I, E, A
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    class Meta:
        ordering = ["codigo"]

    def __str__(self):
        return f"[{self.codigo}] {self.nombre}"


class Amenaza(models.Model):
    TIPOS = [
        ("natural", "Natural"),
        ("accidental", "Accidental"),
        ("no_intencional", "No intencional"),
        ("intencional", "Intencional"),
    ]

    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE, related_name="amenazas"
    )
    grupo = models.ForeignKey(GrupoAmenaza, on_delete=models.PROTECT, related_name="amenazas")
    id_magerit = models.CharField(max_length=10)  # N.1, I.1, E.1, A.1...
    nombre = models.CharField(max_length=200)
    descripcion_medisalud = models.TextField(blank=True)
    tipo = models.CharField(max_length=20, choices=TIPOS, default="intencional")
    # TEF de tres puntos (eventos/año)
    tef_o = models.FloatField(default=0)
    tef_mp = models.FloatField(default=0)
    tef_p = models.FloatField(default=0)
    tef_pert = models.FloatField(null=True, blank=True)
    nivel_probabilidad = models.IntegerField(null=True, blank=True)
    # Dimensiones CIA afectadas
    afecta_c = models.BooleanField(default=False)
    afecta_i = models.BooleanField(default=False)
    afecta_d = models.BooleanField(default=False)
    activos_tipicos = models.TextField(blank=True)
    activos = models.ManyToManyField("activos.Activo", blank=True, related_name="amenazas")
    es_critica_lopdp = models.BooleanField(default=False)
    precargada = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Amenaza"
        verbose_name_plural = "Amenazas"
        ordering = ["grupo__codigo", "id_magerit"]

    def __str__(self):
        return f"{self.id_magerit} · {self.nombre}"

    def save(self, *args, **kwargs):
        self.tef_pert = f_pert(self.tef_o, self.tef_mp, self.tef_p)
        self.nivel_probabilidad = nivel_probabilidad(self.tef_pert)
        super().save(*args, **kwargs)


class Vulnerabilidad(models.Model):
    TIPOS = [
        ("tecnologica", "Tecnológica"),
        ("organizacional", "Organizacional"),
        ("proceso", "De proceso"),
    ]
    SEVERIDADES = [(5, "MA · Muy Alta"), (4, "A · Alta"), (3, "M · Media"),
                   (2, "B · Baja"), (1, "MB · Muy Baja")]

    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE, related_name="vulnerabilidades"
    )
    id_vuln = models.CharField(max_length=10)  # VT-01, VO-01, VP-01
    nombre = models.CharField(max_length=200)
    descripcion_medisalud = models.TextField(blank=True)
    tipo = models.CharField(max_length=15, choices=TIPOS, default="tecnologica")
    severidad = models.IntegerField(choices=SEVERIDADES, default=3)
    degradacion = models.FloatField(null=True, blank=True)
    afecta_c = models.BooleanField(default=False)
    afecta_i = models.BooleanField(default=False)
    afecta_d = models.BooleanField(default=False)
    amenazas_asociadas = models.ManyToManyField(Amenaza, blank=True, related_name="vulnerabilidades")
    precargada = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Vulnerabilidad"
        verbose_name_plural = "Vulnerabilidades"
        ordering = ["id_vuln"]

    def __str__(self):
        return f"{self.id_vuln} · {self.nombre}"

    def save(self, *args, **kwargs):
        self.degradacion = DEGRADACION_POR_SEVERIDAD.get(self.severidad, 0.6)
        super().save(*args, **kwargs)


class Control(models.Model):
    ESTADOS = [("ausente", "Ausente"), ("parcial", "Parcial"),
               ("implementado", "Implementado y auditado")]

    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE, related_name="controles"
    )
    id_control = models.CharField(max_length=10)  # CTR-01...
    nombre = models.CharField(max_length=200)
    referencia_iso = models.CharField(max_length=50, blank=True)  # ISO 27002:2022
    estado = models.CharField(max_length=14, choices=ESTADOS, default="parcial")
    frc = models.FloatField(null=True, blank=True)
    vulnerabilidades_mitigadas = models.ManyToManyField(
        Vulnerabilidad, blank=True, related_name="controles"
    )
    activos_protegidos = models.TextField(blank=True)
    precargado = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Control"
        verbose_name_plural = "Controles"
        ordering = ["id_control"]

    def __str__(self):
        return f"{self.id_control} · {self.nombre}"

    def save(self, *args, **kwargs):
        self.frc = FRC_POR_ESTADO.get(self.estado, 0.6)
        super().save(*args, **kwargs)
