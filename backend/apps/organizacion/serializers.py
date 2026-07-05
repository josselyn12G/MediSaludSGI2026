from rest_framework import serializers

from .models import MarcoReferencia, Organizacion


class MarcoReferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarcoReferencia
        fields = ["id", "norma", "elemento_incorporado", "aplicacion", "orden"]


class OrganizacionSerializer(serializers.ModelSerializer):
    marcos = MarcoReferenciaSerializer(many=True, read_only=True)

    class Meta:
        model = Organizacion
        fields = "__all__"
