from rest_framework import serializers

from .models import Activo, ProcesoNegocio, TipoActivo


class TipoActivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoActivo
        fields = "__all__"


class ProcesoNegocioSerializer(serializers.ModelSerializer):
    nivel_display = serializers.CharField(
        source="get_nivel_importancia_display", read_only=True
    )

    class Meta:
        model = ProcesoNegocio
        fields = [
            "id", "organizacion", "codigo", "nombre", "responsable",
            "descripcion", "nivel_importancia", "nivel_display",
        ]


class ActivoSerializer(serializers.ModelSerializer):
    tipo_codigo = serializers.CharField(source="tipo.codigo", read_only=True)
    tipo_nombre = serializers.CharField(source="tipo.nombre", read_only=True)
    tipo_formula = serializers.CharField(source="tipo.formula", read_only=True)
    proceso_codigo = serializers.CharField(
        source="proceso_asociado.codigo", read_only=True, default=None
    )
    proceso_nombre = serializers.CharField(
        source="proceso_asociado.nombre", read_only=True, default=None
    )

    class Meta:
        model = Activo
        fields = [
            "id", "organizacion", "codigo", "nombre",
            "tipo", "tipo_codigo", "tipo_nombre", "tipo_formula",
            "propietario", "custodio_tecnico", "ubicacion",
            "proceso_asociado", "proceso_codigo", "proceso_nombre",
            "estado", "procesa_datos_salud",
            "dim_confidencialidad", "dim_integridad", "dim_disponibilidad",
            "dim_legal", "dim_operativo", "dim_economico",
            "dim_exposicion", "dim_sensibilidad",
            "vag_score", "vad_score", "va_normalizado",
            "nivel_criticidad", "clasificacion_nc", "clasificacion", "controles_minimos",
            "notas", "creado_en", "actualizado_en",
        ]
        read_only_fields = [
            "vag_score", "vad_score", "va_normalizado", "nivel_criticidad",
            "clasificacion_nc", "controles_minimos", "creado_en", "actualizado_en",
        ]
