"""Escenarios de riesgo · valoración RI/RR/ALE + Monte Carlo (Fases 3 y 4)."""
import random
import re

from django.db import models

# Distribución Beta-PERT de Loss Magnitude por nivel de impacto I (§6.4)
LOSS_BY_I = {
    1: (0, 400, 1200),
    2: (800, 4500, 12000),
    3: (8000, 40000, 110000),
    4: (80000, 200000, 550000),
    5: (300000, 550000, 1100000),
}


def nivel_rr(rr):
    if rr >= 20:
        return "Crítico"
    if rr >= 12:
        return "Alto"
    if rr >= 6:
        return "Medio"
    return "Bajo"


def pert_mean(o, m, p):
    return (o + 4 * m + p) / 6


def pert_sample(o, m, p):
    """Muestra una distribución Beta-PERT."""
    if p <= o:
        return o
    alpha = 1 + 4 * (m - o) / (p - o)
    beta = 1 + 4 * (p - m) / (p - o)
    return o + random.betavariate(alpha, beta) * (p - o)


class Escenario(models.Model):
    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE, related_name="escenarios"
    )
    codigo = models.CharField(max_length=10)
    nombre = models.CharField(max_length=200)
    activos = models.CharField(max_length=120, blank=True)
    p = models.IntegerField(default=1, help_text="Probabilidad 1–5")
    i = models.IntegerField(default=1, help_text="Impacto 1–5 = máx(C,I,D)")
    d = models.FloatField(default=1.0, help_text="Degradación")
    frc = models.FloatField(default=1.0, help_text="Factor de reducción del control")
    # PERT de frecuencia efectiva (eventos/año)
    freq_o = models.FloatField(default=0.1)
    freq_mp = models.FloatField(default=1)
    freq_p = models.FloatField(default=4)
    # Resultados publicados (§6.5)
    ale_pert = models.FloatField(null=True, blank=True)
    ale_p90 = models.FloatField(null=True, blank=True)
    # Calculados
    rr = models.IntegerField(null=True, blank=True)
    nivel = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Escenario de Riesgo"
        verbose_name_plural = "Escenarios de Riesgo"
        ordering = ["-rr", "codigo"]

    def __str__(self):
        return f"{self.codigo} · {self.nombre}"

    def save(self, *args, **kwargs):
        self.rr = self.p * self.i
        self.nivel = nivel_rr(self.rr)
        super().save(*args, **kwargs)

    # --- Monte Carlo ---------------------------------------------------------
    def loss_triple(self):
        return LOSS_BY_I.get(self.i, LOSS_BY_I[3])

    def ale_pert_calc(self):
        """ALE determinístico = TEF_PERT × LM_PERT × FRC."""
        lo, lm, lp = self.loss_triple()
        return pert_mean(self.freq_o, self.freq_mp, self.freq_p) * pert_mean(lo, lm, lp) * self.frc

    def simular(self, n=10000):
        n = max(1000, min(int(n), 50000))
        lo, lm, lp = self.loss_triple()
        resultados = []
        for _ in range(n):
            f = pert_sample(self.freq_o, self.freq_mp, self.freq_p)
            loss = pert_sample(lo, lm, lp) * self.frc
            resultados.append(f * loss)
        resultados.sort()

        def pct(q):
            idx = min(len(resultados) - 1, int(q * len(resultados)))
            return resultados[idx]

        media = sum(resultados) / len(resultados)
        umbral = 200000
        excede = sum(1 for r in resultados if r > umbral) / len(resultados)

        # Histograma (30 bins)
        lo_h, hi_h = resultados[0], resultados[-1]
        bins = 30
        ancho = (hi_h - lo_h) / bins or 1
        hist = [0] * bins
        for r in resultados:
            b = min(bins - 1, int((r - lo_h) / ancho))
            hist[b] += 1
        histograma = [
            {"x": round(lo_h + (k + 0.5) * ancho), "count": hist[k]} for k in range(bins)
        ]

        return {
            "n": n,
            "media": round(media),
            "p50": round(pct(0.50)),
            "p90": round(pct(0.90)),
            "p95": round(pct(0.95)),
            "min": round(resultados[0]),
            "max": round(resultados[-1]),
            "prob_excedencia_200k": round(excede * 100, 1),
            "histograma": histograma,
        }


# =============================================================================
# Sprint 2 · Escenario de Riesgo basado en FK (flujo de 8 pasos del wizard)
# Aditivo: el Escenario legacy de arriba sigue alimentando el dashboard actual.
# =============================================================================
class EscenarioRiesgo(models.Model):
    ESTRATEGIAS = [
        ("mitigar", "Mitigar"), ("transferir", "Transferir"),
        ("aceptar", "Aceptar"), ("evitar", "Evitar"),
    ]
    NIVELES = [("critico", "Crítico"), ("alto", "Alto"), ("medio", "Medio"), ("bajo", "Bajo")]
    ESTADOS = [
        ("borrador", "Borrador"), ("tef_pendiente", "TEF pendiente"),
        ("calculado", "Calculado"), ("evaluado", "Evaluado"),
        ("en_tratamiento", "En tratamiento"), ("completado", "Completado"),
    ]

    organizacion = models.ForeignKey(
        "organizacion.Organizacion", on_delete=models.CASCADE, related_name="escenarios_riesgo"
    )
    codigo = models.CharField(max_length=12, blank=True)
    nombre = models.CharField(max_length=200, blank=True)
    # Paso 1-3: componentes
    activo = models.ForeignKey("activos.Activo", on_delete=models.CASCADE, related_name="escenarios")
    amenaza = models.ForeignKey("amenazas.Amenaza", on_delete=models.PROTECT, related_name="escenarios")
    vulnerabilidad = models.ForeignKey("amenazas.Vulnerabilidad", on_delete=models.PROTECT, related_name="escenarios")
    control_existente = models.ForeignKey(
        "amenazas.Control", null=True, blank=True, on_delete=models.SET_NULL, related_name="escenarios"
    )
    # Paso 4: TEF del analista
    tef_o_analista = models.FloatField(null=True, blank=True)
    tef_mp_analista = models.FloatField(null=True, blank=True)
    tef_p_analista = models.FloatField(null=True, blank=True)
    tef_pert_efectivo = models.FloatField(null=True, blank=True)
    justificacion_tef = models.TextField(blank=True)
    consulta_ia_tef = models.TextField(blank=True)
    fuentes_tef = models.TextField(blank=True)
    # Dimensiones CIA del escenario
    impacto_c = models.IntegerField(null=True, blank=True)
    impacto_i = models.IntegerField(null=True, blank=True)
    impacto_d = models.IntegerField(null=True, blank=True)
    impacto_max = models.IntegerField(null=True, blank=True)
    # Paso 5: resultados
    va = models.IntegerField(null=True, blank=True)
    p_nivel = models.IntegerField(null=True, blank=True)
    d = models.FloatField(null=True, blank=True)
    frc = models.FloatField(null=True, blank=True)
    ri = models.FloatField(null=True, blank=True)
    rr = models.FloatField(null=True, blank=True)
    rr_simple = models.IntegerField(null=True, blank=True)
    ale_pert_usd = models.FloatField(null=True, blank=True)
    ale_p50_usd = models.FloatField(null=True, blank=True)
    ale_p90_usd = models.FloatField(null=True, blank=True)
    ale_p95_usd = models.FloatField(null=True, blank=True)
    prob_excedencia_200k = models.FloatField(null=True, blank=True)
    # Paso 6-7
    nivel = models.CharField(max_length=10, choices=NIVELES, blank=True)
    estrategia_tratamiento = models.CharField(max_length=12, choices=ESTRATEGIAS, blank=True)
    sugerencia_ia_tratamiento = models.TextField(blank=True)
    controles_propuestos = models.ManyToManyField(
        "amenazas.Control", blank=True, related_name="escenarios_propuestos"
    )
    costo_control_estimado_usd = models.FloatField(null=True, blank=True)
    roi_estimado = models.FloatField(null=True, blank=True)
    decision_analista = models.TextField(blank=True)
    aprobado_por = models.CharField(max_length=200, blank=True)
    estado = models.CharField(max_length=16, choices=ESTADOS, default="borrador")
    creado_por = models.ForeignKey(
        "accounts.Usuario", null=True, blank=True, on_delete=models.SET_NULL, related_name="escenarios_creados"
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Escenario de Riesgo (wizard)"
        verbose_name_plural = "Escenarios de Riesgo (wizard)"
        ordering = ["-rr_simple", "codigo"]

    def __str__(self):
        return f"{self.codigo or 'ESC'} · {self.nombre or self.activo.codigo}"

    def save(self, *args, **kwargs):
        # Autoasigna el siguiente código ESC-NN de la organización si viene vacío
        if not self.codigo:
            usados = (EscenarioRiesgo.objects.filter(organizacion=self.organizacion)
                      .exclude(pk=self.pk).values_list("codigo", flat=True))
            nums = [int(m.group(1)) for c in usados if c
                    for m in [re.match(r"ESC-(\d+)$", c)] if m]
            self.codigo = f"ESC-{max(nums, default=0) + 1:02d}"
        super().save(*args, **kwargs)

    def recalcular(self, n=10000, persist_simulacion=True):
        """Paso 5: ejecuta fórmulas MAGERIT + Monte Carlo con el motor del servicio."""
        from .services import montecarlo as mc

        # Parámetros derivados de los componentes
        self.va = self.activo.va_normalizado or 1
        self.d = self.vulnerabilidad.degradacion or 0.6
        self.frc = self.control_existente.frc if self.control_existente else 1.0
        if self.impacto_c is None:
            self.impacto_c = self.activo.dim_confidencialidad
        if self.impacto_i is None:
            self.impacto_i = self.activo.dim_integridad
        if self.impacto_d is None:
            self.impacto_d = self.activo.dim_disponibilidad
        self.impacto_max = max(self.impacto_c, self.impacto_i, self.impacto_d)

        # TEF: usa los del analista; si faltan, hereda los de la amenaza del catálogo
        o = self.tef_o_analista if self.tef_o_analista is not None else self.amenaza.tef_o
        mp = self.tef_mp_analista if self.tef_mp_analista is not None else self.amenaza.tef_mp
        p = self.tef_p_analista if self.tef_p_analista is not None else self.amenaza.tef_p
        self.tef_o_analista, self.tef_mp_analista, self.tef_p_analista = o, mp, p

        formulas = mc.calcular_formulas_magerit(
            va=self.va, tef_o=o, tef_mp=mp, tef_p=p, d=self.d, frc=self.frc,
            impacto_max=self.impacto_max,
        )
        self.tef_pert_efectivo = formulas["tef_pert"]
        self.p_nivel = formulas["p_nivel"]
        self.ri = formulas["ri"]
        self.rr = formulas["rr"]
        self.rr_simple = formulas["rr_simple"]
        self.ale_pert_usd = formulas["ale_pert_usd"]
        self.nivel = mc.nivel_desde_rr(self.rr_simple)

        sim = mc.ejecutar_simulacion(
            tef_o=o, tef_mp=mp, tef_p=p, frc=self.frc,
            impacto_c=self.impacto_c, impacto_i=self.impacto_i, impacto_d=self.impacto_d, n=n,
        )
        self.ale_p50_usd = sim["ale_p50"]
        self.ale_p90_usd = sim["ale_p90"]
        self.ale_p95_usd = sim["ale_p95"]
        self.prob_excedencia_200k = sim["prob_excedencia_200k"]
        if self.estado in ("borrador", "tef_pendiente"):
            self.estado = "calculado"
        self.save()

        if persist_simulacion:
            SimulacionMonteCarlo.objects.create(
                escenario=self, n_iteraciones=sim["n_iteraciones"],
                tef_o=o, tef_mp=mp, tef_p=p, frc_usado=self.frc,
                impacto_c=self.impacto_c, impacto_i=self.impacto_i, impacto_d=self.impacto_d,
                ale_media=sim["ale_media"], ale_p50=sim["ale_p50"],
                ale_p90=sim["ale_p90"], ale_p95=sim["ale_p95"],
                prob_excedencia_200k=sim["prob_excedencia_200k"],
            )
        return sim


class SimulacionMonteCarlo(models.Model):
    """Registro de auditoría de cada simulación ejecutada."""
    escenario = models.ForeignKey(EscenarioRiesgo, on_delete=models.CASCADE, related_name="simulaciones")
    n_iteraciones = models.IntegerField(default=10000)
    tef_o = models.FloatField()
    tef_mp = models.FloatField()
    tef_p = models.FloatField()
    frc_usado = models.FloatField()
    impacto_c = models.IntegerField(null=True, blank=True)
    impacto_i = models.IntegerField(null=True, blank=True)
    impacto_d = models.IntegerField(null=True, blank=True)
    ale_media = models.FloatField()
    ale_p50 = models.FloatField()
    ale_p90 = models.FloatField()
    ale_p95 = models.FloatField()
    prob_excedencia_200k = models.FloatField()
    ejecutado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-ejecutado_en"]

    def __str__(self):
        return f"Sim {self.escenario_id} · {self.ejecutado_en:%Y-%m-%d %H:%M}"
