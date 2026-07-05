from rest_framework import serializers

from .models import Escenario, EscenarioRiesgo, SimulacionMonteCarlo


class EscenarioSerializer(serializers.ModelSerializer):
    ale_pert_calc = serializers.SerializerMethodField()

    class Meta:
        model = Escenario
        fields = [
            "id", "organizacion", "codigo", "nombre", "activos",
            "p", "i", "d", "frc", "freq_o", "freq_mp", "freq_p",
            "ale_pert", "ale_p90", "rr", "nivel", "ale_pert_calc",
        ]
        read_only_fields = ["rr", "nivel"]

    def get_ale_pert_calc(self, obj):
        return round(obj.ale_pert_calc())


# --- Sprint 2: Escenario de Riesgo (wizard de 8 pasos) -----------------------
class EscenarioRiesgoSerializer(serializers.ModelSerializer):
    # Lecturas legibles de los componentes
    activo_codigo = serializers.CharField(source="activo.codigo", read_only=True)
    activo_nombre = serializers.CharField(source="activo.nombre", read_only=True)
    amenaza_codigo = serializers.CharField(source="amenaza.id_magerit", read_only=True)
    amenaza_nombre = serializers.CharField(source="amenaza.nombre", read_only=True)
    vulnerabilidad_codigo = serializers.CharField(source="vulnerabilidad.id_vuln", read_only=True)
    vulnerabilidad_nombre = serializers.CharField(source="vulnerabilidad.nombre", read_only=True)
    control_codigo = serializers.CharField(source="control_existente.id_control", read_only=True, default=None)
    nivel_display = serializers.CharField(source="get_nivel_display", read_only=True)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)
    creado_por_email = serializers.CharField(source="creado_por.email", read_only=True, default=None)
    controles_info = serializers.SerializerMethodField()

    def get_controles_info(self, obj):
        return [{"id": c.id, "codigo": c.id_control, "nombre": c.nombre} for c in obj.controles_propuestos.all()]

    class Meta:
        model = EscenarioRiesgo
        fields = [
            "id", "organizacion", "codigo", "nombre",
            "activo", "activo_codigo", "activo_nombre",
            "amenaza", "amenaza_codigo", "amenaza_nombre",
            "vulnerabilidad", "vulnerabilidad_codigo", "vulnerabilidad_nombre",
            "control_existente", "control_codigo",
            "tef_o_analista", "tef_mp_analista", "tef_p_analista", "tef_pert_efectivo",
            "justificacion_tef", "consulta_ia_tef", "fuentes_tef",
            "impacto_c", "impacto_i", "impacto_d", "impacto_max",
            "va", "p_nivel", "d", "frc", "ri", "rr", "rr_simple",
            "ale_pert_usd", "ale_p50_usd", "ale_p90_usd", "ale_p95_usd", "prob_excedencia_200k",
            "nivel", "nivel_display", "estrategia_tratamiento", "sugerencia_ia_tratamiento",
            "controles_propuestos", "costo_control_estimado_usd", "roi_estimado",
            "decision_analista", "aprobado_por", "estado", "estado_display",
            "creado_por_email", "controles_info", "creado_en", "actualizado_en",
        ]
        read_only_fields = [
            "tef_pert_efectivo", "impacto_max", "va", "p_nivel", "d", "frc",
            "ri", "rr", "rr_simple", "ale_pert_usd", "ale_p50_usd", "ale_p90_usd",
            "ale_p95_usd", "prob_excedencia_200k", "nivel", "creado_en", "actualizado_en",
        ]


class SimulacionMonteCarloSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulacionMonteCarlo
        fields = "__all__"
