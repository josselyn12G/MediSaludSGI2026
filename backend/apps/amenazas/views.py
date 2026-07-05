from django.db.models import Count
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Amenaza, Control, GrupoAmenaza, Vulnerabilidad
from .serializers import (
    AmenazaSerializer, ControlSerializer, GrupoAmenazaSerializer, VulnerabilidadSerializer,
)


class ReadOnlyOrAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class GrupoAmenazaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GrupoAmenaza.objects.all()
    serializer_class = GrupoAmenazaSerializer
    permission_classes = [ReadOnlyOrAuth]


class AmenazaViewSet(viewsets.ModelViewSet):
    queryset = Amenaza.objects.select_related("organizacion", "grupo").prefetch_related("activos").all()
    serializer_class = AmenazaSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["grupo__codigo", "es_critica_lopdp", "nivel_probabilidad", "organizacion"]
    search_fields = ["id_magerit", "nombre", "descripcion_medisalud"]
    ordering_fields = ["id_magerit", "tef_pert", "nivel_probabilidad"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            "total": qs.count(),
            "criticas": qs.filter(es_critica_lopdp=True).count(),
            "por_grupo": {
                r["grupo__codigo"]: r["c"]
                for r in qs.values("grupo__codigo").annotate(c=Count("id"))
            },
            "max_fpert": max([a.tef_pert or 0 for a in qs], default=0),
        })


class VulnerabilidadViewSet(viewsets.ModelViewSet):
    queryset = Vulnerabilidad.objects.prefetch_related("amenazas_asociadas").all()
    serializer_class = VulnerabilidadSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["tipo", "severidad", "organizacion"]
    search_fields = ["id_vuln", "nombre", "descripcion_medisalud"]


class ControlViewSet(viewsets.ModelViewSet):
    queryset = Control.objects.prefetch_related("vulnerabilidades_mitigadas").all()
    serializer_class = ControlSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["estado", "organizacion"]
    search_fields = ["id_control", "nombre", "referencia_iso"]

    @action(detail=True, methods=["patch"])
    def estado(self, request, pk=None):
        """Actualiza el estado del control → recalcula FRC automáticamente."""
        control = self.get_object()
        nuevo = request.data.get("estado")
        if nuevo not in dict(Control.ESTADOS):
            return Response({"error": "Estado inválido."}, status=status.HTTP_400_BAD_REQUEST)
        control.estado = nuevo
        control.save()  # save() recalcula frc
        return Response(ControlSerializer(control).data)
