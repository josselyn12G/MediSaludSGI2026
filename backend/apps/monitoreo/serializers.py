from rest_framework import serializers

from .models import KPI, CicloMonitoreo, TareaMonitoreo


class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = "__all__"


class CicloMonitoreoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CicloMonitoreo
        fields = "__all__"


class TareaMonitoreoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TareaMonitoreo
        fields = "__all__"
        read_only_fields = ["creado_en", "actualizado_en"]