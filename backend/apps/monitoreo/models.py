"""Indicadores clave de desempeño (KPIs) — Fase 6 (§9.2)."""

from django.db import models


class KPI(models.Model):
    organizacion = models.ForeignKey(
        "organizacion.Organizacion",
        on_delete=models.CASCADE,
        related_name="kpis"
    )
    codigo = models.CharField(max_length=10)
    nombre = models.CharField(max_length=200)
    formula = models.CharField(max_length=255, blank=True)
    linea_base = models.CharField(max_length=60, blank=True)
    meta = models.CharField(max_length=60, blank=True)
    umbral_alerta = models.CharField(max_length=255, blank=True)
    frecuencia = models.CharField(max_length=40, blank=True)
    responsable = models.CharField(max_length=120, blank=True)

    class Meta:
        verbose_name = "KPI"
        verbose_name_plural = "KPIs"
        ordering = ["codigo"]

    def __str__(self):
        return f"{self.codigo} · {self.nombre}"


class TareaMonitoreo(models.Model):
    """Paso del plan de monitoreo de un escenario de riesgo (§9.1).

    El analista define/edita las tareas y marca su cumplimiento con checks.
    Se pueden generar sugeridas desde las actividades del ciclo + controles.
    """

    organizacion = models.ForeignKey(
        "organizacion.Organizacion",
        on_delete=models.CASCADE,
        related_name="tareas_monitoreo"
    )
    escenario = models.ForeignKey(
        "riesgos.EscenarioRiesgo",
        on_delete=models.CASCADE,
        related_name="tareas_monitoreo"
    )
    descripcion = models.TextField()
    completada = models.BooleanField(default=False)
    orden = models.IntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tarea de Monitoreo"
        verbose_name_plural = "Tareas de Monitoreo"
        ordering = ["escenario_id", "orden", "id"]

    def __str__(self):
        return f"[{'x' if self.completada else ' '}] {self.descripcion[:60]}"


class CicloMonitoreo(models.Model):
    """Ciclo de monitoreo continuo — Fase 6 (§9.1)."""

    organizacion = models.ForeignKey(
        "organizacion.Organizacion",
        on_delete=models.CASCADE,
        related_name="ciclos_monitoreo"
    )
    frecuencia = models.CharField(max_length=20)
    nivel_riesgo_aplicable = models.CharField(max_length=60)
    actividades = models.TextField()
    disparadores_reevaluacion = models.TextField()
    responsable = models.CharField(max_length=150)
    orden = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Ciclo de Monitoreo"
        verbose_name_plural = "Ciclos de Monitoreo"
        ordering = ["orden"]

    def __str__(self):
        return f"{self.frecuencia} · {self.nivel_riesgo_aplicable}"