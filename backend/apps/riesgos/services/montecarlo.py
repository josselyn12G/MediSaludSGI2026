"""Motor de cálculo cuantitativo de riesgo (Fase 4 · §6.3 del PDF).

- Fórmulas MAGERIT determinísticas: RI = VA·P·D, RR = RI·FRC, ALE_PERT.
- Simulación Monte Carlo sobre distribuciones Beta-PERT (frecuencia × magnitud).

Usa numpy si está disponible (vectorizado, rápido); si no, cae a una
implementación pura en stdlib con el módulo `random`, para que el motor
funcione incluso antes de reconstruir la imagen con numpy.
"""
from __future__ import annotations

try:
    import numpy as _np
    HAVE_NUMPY = True
except ImportError:  # pragma: no cover - fallback sin numpy
    _np = None
    HAVE_NUMPY = False

import random as _random

# Tabla de Magnitud de Pérdida (USD) por nivel de impacto — §4.2.1 del PDF.
LM_POR_IMPACTO = {
    5: (300000, 550000, 1100000),
    4: (80000, 200000, 550000),
    3: (8000, 40000, 110000),
    2: (800, 4500, 12000),
    1: (0, 400, 1200),
}


def obtener_lm_params(nivel_impacto):
    """Devuelve (O, MP, P) en USD según el nivel de impacto 1–5."""
    return LM_POR_IMPACTO.get(nivel_impacto, (0, 0, 0))


def pert_mean(o, mp, p):
    """Esperanza PERT de tres puntos: (O + 4·MP + P) / 6."""
    return (o + 4 * mp + p) / 6


def calcular_nivel_probabilidad(tef_pert):
    """Convierte TEF_PERT (eventos/año) a nivel ordinal 1–5 (§4.3)."""
    if tef_pert > 52:
        return 5
    if tef_pert >= 1:
        return 4
    if tef_pert >= 0.1:
        return 3
    if tef_pert >= 0.01:
        return 2
    return 1


def _beta_pert_params(o, mp, p):
    """Parámetros (alpha, beta) de la distribución Beta-PERT estándar."""
    if p <= o:
        return None
    mu = (o + 4 * mp + p) / 6
    sigma2 = ((p - o) ** 2) / 36
    if sigma2 == 0 or mu <= o or mu >= p:
        return None
    alpha = ((mu - o) / (p - o)) * ((mu - o) * (p - mu) / sigma2 - 1)
    beta = alpha * (p - mu) / (mu - o)
    if alpha <= 0 or beta <= 0:
        return None
    return alpha, beta


def beta_pert_samples(o, mp, p, n=10000):
    """Genera N muestras de una distribución Beta-PERT(o, mp, p)."""
    o, mp, p = float(o), float(mp), float(p)
    params = _beta_pert_params(o, mp, p)

    if HAVE_NUMPY:
        if params is None:
            return _np.full(n, mp)
        alpha, beta = params
        return o + _np.random.beta(alpha, beta, n) * (p - o)

    # Fallback puro
    if params is None:
        return [mp] * n
    alpha, beta = params
    span = p - o
    return [o + _random.betavariate(alpha, beta) * span for _ in range(n)]


def _zeros(n):
    return _np.zeros(n) if HAVE_NUMPY else [0.0] * n


def _percentile(samples, q):
    if HAVE_NUMPY:
        return float(_np.percentile(samples, q))
    s = sorted(samples)
    idx = min(len(s) - 1, int(q / 100 * len(s)))
    return float(s[idx])


def _mean(samples):
    if HAVE_NUMPY:
        return float(_np.mean(samples))
    return sum(samples) / len(samples)


def _prob_excedencia(samples, umbral):
    if HAVE_NUMPY:
        return float(_np.mean(samples > umbral))
    return sum(1 for s in samples if s > umbral) / len(samples)


def _histograma(samples, bins=50):
    if HAVE_NUMPY:
        counts, edges = _np.histogram(samples, bins=bins)
        return counts.tolist(), edges.tolist()
    lo, hi = min(samples), max(samples)
    ancho = (hi - lo) / bins or 1
    counts = [0] * bins
    for s in samples:
        b = min(bins - 1, int((s - lo) / ancho))
        counts[b] += 1
    edges = [lo + k * ancho for k in range(bins + 1)]
    return counts, edges


def ejecutar_simulacion(*, tef_o, tef_mp, tef_p, frc,
                        impacto_c=None, impacto_i=None, impacto_d=None,
                        n=10000, umbral=200000):
    """Simulación Monte Carlo completa para un escenario (§6.3, pasos 1–5).

    1. Frecuencia anual ~ BetaPERT(tef_o, tef_mp, tef_p).
    2. Magnitud por dimensión CIA afectada ~ BetaPERT de su tabla LM.
    3. Magnitud total efectiva = (LM_C + LM_I + LM_D) × FRC.
    4. ALE por iteración = frecuencia × magnitud total.
    5. Estadísticos: media, P50, P90, P95, P(ALE > umbral).
    """
    n = max(1000, min(int(n), 50000))
    f = beta_pert_samples(tef_o, tef_mp, tef_p, n)

    lm_c = lm_i = lm_d = _zeros(n)
    if impacto_c:
        lm_c = beta_pert_samples(*obtener_lm_params(impacto_c), n)
    if impacto_i:
        lm_i = beta_pert_samples(*obtener_lm_params(impacto_i), n)
    if impacto_d:
        lm_d = beta_pert_samples(*obtener_lm_params(impacto_d), n)

    if HAVE_NUMPY:
        lm_total = (lm_c + lm_i + lm_d) * frc
        ale = f * lm_total
    else:
        lm_total = [(lm_c[k] + lm_i[k] + lm_d[k]) * frc for k in range(n)]
        ale = [f[k] * lm_total[k] for k in range(n)]

    counts, edges = _histograma(ale)
    return {
        "n_iteraciones": n,
        "ale_media": round(_mean(ale)),
        "ale_p50": round(_percentile(ale, 50)),
        "ale_p90": round(_percentile(ale, 90)),
        "ale_p95": round(_percentile(ale, 95)),
        "prob_excedencia_200k": round(_prob_excedencia(ale, umbral) * 100, 1),
        "histograma": counts,
        "histograma_edges": [round(e) for e in edges],
        "motor": "numpy" if HAVE_NUMPY else "stdlib",
    }


def calcular_formulas_magerit(*, va, tef_o, tef_mp, tef_p, d, frc, impacto_max):
    """Calcula TEF_PERT, nivel P, RI, RR, RR_simple y ALE_PERT determinístico."""
    tef_pert = pert_mean(tef_o, tef_mp, tef_p)
    p_nivel = calcular_nivel_probabilidad(tef_pert)
    _, lm_mp, _ = obtener_lm_params(impacto_max)

    ri = va * p_nivel * d
    rr = ri * frc
    return {
        "tef_pert": round(tef_pert, 4),
        "p_nivel": p_nivel,
        "ri": round(ri, 2),
        "rr": round(rr, 2),
        "rr_simple": p_nivel * impacto_max,
        "ale_pert_usd": round(tef_pert * lm_mp),
    }


def nivel_desde_rr(rr_simple):
    """Clasifica el RR_simple (P×I, 1–25) en nivel de criticidad."""
    if rr_simple >= 20:
        return "critico"
    if rr_simple >= 12:
        return "alto"
    if rr_simple >= 6:
        return "medio"
    return "bajo"
