from rest_framework import serializers

from .models import PlanTratamiento


class PlanTratamientoSerializer(serializers.ModelSerializer):
    estrategia_display = serializers.CharField(source="get_estrategia_display", read_only=True)
    reduccion_pct = serializers.FloatField(read_only=True)

    class Meta:
        model = PlanTratamiento
        fields = [
            "id", "organizacion", "escenario_codigo", "escenario_nombre", "rr",
            "estrategia", "estrategia_display", "controles", "medidas",
            "ale_actual", "ale_objetivo", "reduccion_pct",
        ]
