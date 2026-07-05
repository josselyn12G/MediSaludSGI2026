"""Serializers de catálogos.

Exponen los nombres "clásicos" (grupo, codigo, f_o…, cia, amenazas_asociadas
como texto) para mantener compatibilidad con la UI existente, y además los
campos nuevos del Sprint 2 (id_magerit, tef_*, afecta_c/i/d, precargada, M2M).
"""
from rest_framework import serializers

from apps.activos.models import Activo

from .models import Amenaza, Control, GrupoAmenaza, Vulnerabilidad

# grupo de amenaza -> tipo del modelo
TIPO_POR_GRUPO = {"N": "natural", "I": "accidental", "E": "no_intencional", "A": "intencional"}
# grupo de vulnerabilidad (UI) <-> tipo del modelo
TIPO_POR_GRUPO_VULN = {"VT": "tecnologica", "VO": "organizacional", "VP": "proceso"}
GRUPO_VULN_POR_TIPO = {v: k for k, v in TIPO_POR_GRUPO_VULN.items()}


def parse_cia(texto):
    tokens = [t.strip().upper() for t in (texto or "").split(",")]
    return ("C" in tokens, "I" in tokens, "D" in tokens)


def compose_cia(obj):
    return ",".join(d for d, on in (("C", obj.afecta_c), ("I", obj.afecta_i), ("D", obj.afecta_d)) if on)


class AmenazaSerializer(serializers.ModelSerializer):
    # Compatibilidad UI
    grupo = serializers.SlugRelatedField(slug_field="codigo", queryset=GrupoAmenaza.objects.all())
    codigo = serializers.CharField(source="id_magerit")
    descripcion = serializers.CharField(source="descripcion_medisalud", required=False, allow_blank=True)
    f_o = serializers.FloatField(source="tef_o")
    f_mp = serializers.FloatField(source="tef_mp")
    f_p = serializers.FloatField(source="tef_p")
    f_pert = serializers.FloatField(source="tef_pert", read_only=True)
    es_critica = serializers.BooleanField(source="es_critica_lopdp", required=False)
    activos_afectados = serializers.CharField(source="activos_tipicos", required=False, allow_blank=True)
    cia = serializers.CharField(required=False, allow_blank=True)
    grupo_display = serializers.CharField(source="grupo.nombre", read_only=True)
    tipo = serializers.CharField(required=False)  # texto libre desde la UI; se deriva del grupo
    activos = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Activo.objects.all(), required=False)
    activos_codigos = serializers.SerializerMethodField()
    activos_nombres = serializers.SerializerMethodField()

    class Meta:
        model = Amenaza
        fields = [
            "id", "organizacion", "grupo", "grupo_display", "codigo", "nombre",
            "descripcion", "tipo", "f_o", "f_mp", "f_p", "f_pert",
            "nivel_probabilidad", "cia", "activos_afectados", "es_critica",
            "afecta_c", "afecta_i", "afecta_d", "es_critica_lopdp", "precargada",
            "activos", "activos_codigos", "activos_nombres",
        ]
        read_only_fields = ["f_pert", "nivel_probabilidad", "afecta_c", "afecta_i",
                            "afecta_d", "es_critica_lopdp"]

    def get_activos_codigos(self, obj):
        return [a.codigo for a in obj.activos.all()]

    def get_activos_nombres(self, obj):
        return [{"id": a.id, "codigo": a.codigo, "nombre": a.nombre} for a in obj.activos.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["cia"] = compose_cia(instance)
        data["tipo"] = instance.get_tipo_display()
        return data

    def _apply(self, validated):
        cia = validated.pop("cia", None)
        validated.pop("tipo", None)
        grupo = validated.get("grupo")
        if cia is not None:
            validated["afecta_c"], validated["afecta_i"], validated["afecta_d"] = parse_cia(cia)
        if grupo is not None:
            validated["tipo"] = TIPO_POR_GRUPO.get(grupo.codigo, "intencional")
        return validated

    def create(self, validated_data):
        return super().create(self._apply(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._apply(validated_data))


class VulnerabilidadSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source="id_vuln")
    descripcion = serializers.CharField(source="descripcion_medisalud", required=False, allow_blank=True)
    grupo = serializers.CharField(required=False)  # VT/VO/VP desde la UI
    cia = serializers.CharField(required=False, allow_blank=True)
    severidad_display = serializers.CharField(source="get_severidad_display", read_only=True)
    # Asociación real M2M con amenazas (editable por id)
    amenazas = serializers.PrimaryKeyRelatedField(
        many=True, source="amenazas_asociadas", queryset=Amenaza.objects.all(), required=False)
    amenazas_codigos = serializers.SerializerMethodField()
    amenazas_info = serializers.SerializerMethodField()

    class Meta:
        model = Vulnerabilidad
        fields = [
            "id", "organizacion", "grupo", "codigo", "nombre", "descripcion",
            "tipo", "severidad", "severidad_display", "degradacion", "cia",
            "afecta_c", "afecta_i", "afecta_d", "precargada",
            "amenazas", "amenazas_codigos", "amenazas_info",
        ]
        read_only_fields = ["degradacion", "tipo", "afecta_c", "afecta_i", "afecta_d"]

    def get_amenazas_codigos(self, obj):
        return [a.id_magerit for a in obj.amenazas_asociadas.all()]

    def get_amenazas_info(self, obj):
        return [{"id": a.id, "codigo": a.id_magerit, "nombre": a.nombre} for a in obj.amenazas_asociadas.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["grupo"] = GRUPO_VULN_POR_TIPO.get(instance.tipo, "VT")
        data["cia"] = compose_cia(instance)
        return data

    def _apply(self, validated):
        cia = validated.pop("cia", None)
        grupo = validated.pop("grupo", None)
        if cia is not None:
            validated["afecta_c"], validated["afecta_i"], validated["afecta_d"] = parse_cia(cia)
        if grupo is not None:
            validated["tipo"] = TIPO_POR_GRUPO_VULN.get(grupo, "tecnologica")
        return validated

    def create(self, validated_data):
        return super().create(self._apply(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._apply(validated_data))


class ControlSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source="id_control")
    iso_ref = serializers.CharField(source="referencia_iso", required=False, allow_blank=True)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)
    # Asociación real M2M con vulnerabilidades mitigadas (editable por id)
    vulnerabilidades = serializers.PrimaryKeyRelatedField(
        many=True, source="vulnerabilidades_mitigadas",
        queryset=Vulnerabilidad.objects.all(), required=False)
    vulnerabilidades_codigos = serializers.SerializerMethodField()
    vulnerabilidades_info = serializers.SerializerMethodField()

    class Meta:
        model = Control
        fields = [
            "id", "organizacion", "codigo", "nombre", "iso_ref", "estado",
            "estado_display", "frc", "activos_protegidos", "precargado",
            "vulnerabilidades", "vulnerabilidades_codigos", "vulnerabilidades_info",
        ]
        read_only_fields = ["frc"]

    def get_vulnerabilidades_codigos(self, obj):
        return [v.id_vuln for v in obj.vulnerabilidades_mitigadas.all()]

    def get_vulnerabilidades_info(self, obj):
        return [{"id": v.id, "codigo": v.id_vuln, "nombre": v.nombre} for v in obj.vulnerabilidades_mitigadas.all()]


class GrupoAmenazaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoAmenaza
        fields = ["id", "codigo", "nombre", "descripcion"]
