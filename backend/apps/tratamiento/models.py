"""Plan de Tratamiento de Riesgos (PTR) — Fase 5 (§8.2)."""
from django.db import models


class PlanTratamiento(models.Model):
    ESTRATEGIAS = [
        ("mitigar", "Mitigar"), ("transferir", "Transferir"),
        ("aceptar", "Aceptar"), ("evitar", "Evitar"),
    ]
    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE, related_name="planes"
    )
    escenario_codigo = models.CharField(max_length=10)
    escenario_nombre = models.CharField(max_length=200)
    rr = models.IntegerField(default=0)
    estrategia = models.CharField(max_length=20, choices=ESTRATEGIAS, default="mitigar")
    controles = models.CharField(max_length=120, blank=True)
    medidas = models.TextField(blank=True)
    ale_actual = models.FloatField(default=0)
    ale_objetivo = models.FloatField(default=0)

    class Meta:
        verbose_name = "Plan de Tratamiento"
        verbose_name_plural = "Planes de Tratamiento"
        ordering = ["escenario_codigo"]

    def __str__(self):
        return f"{self.escenario_codigo} · {self.get_estrategia_display()}"

    @property
    def reduccion_pct(self):
        if not self.ale_actual:
            return 0
        return round((1 - self.ale_objetivo / self.ale_actual) * 100, 1)
