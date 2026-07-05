from django.db.models import Avg, Count
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Activo, ProcesoNegocio, TipoActivo
from .serializers import (
    ActivoSerializer,
    ProcesoNegocioSerializer,
    TipoActivoSerializer,
)


class ReadOnlyOrAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class TipoActivoViewSet(viewsets.ModelViewSet):
    queryset = TipoActivo.objects.all()
    serializer_class = TipoActivoSerializer
    permission_classes = [ReadOnlyOrAuth]


class ProcesoNegocioViewSet(viewsets.ModelViewSet):
    queryset = ProcesoNegocio.objects.all()
    serializer_class = ProcesoNegocioSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["nivel_importancia", "organizacion"]
    search_fields = ["codigo", "nombre", "responsable"]


class ActivoViewSet(viewsets.ModelViewSet):
    queryset = Activo.objects.select_related(
        "tipo", "proceso_asociado", "organizacion"
    ).all()
    serializer_class = ActivoSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["tipo", "nivel_criticidad", "proceso_asociado", "estado"]
    search_fields = ["codigo", "nombre", "propietario", "custodio_tecnico"]
    ordering_fields = ["codigo", "va_normalizado", "nivel_criticidad", "creado_en"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        total = qs.count()
        por_nivel = {
            row["nivel_criticidad"]: row["c"]
            for row in qs.values("nivel_criticidad").annotate(c=Count("id"))
        }
        por_tipo = [
            {
                "tipo": row["tipo__codigo"],
                "nombre": row["tipo__nombre"],
                "total": row["c"],
            }
            for row in qs.values("tipo__codigo", "tipo__nombre")
            .annotate(c=Count("id"))
            .order_by("-c")
        ]
        va_promedio = qs.aggregate(prom=Avg("va_normalizado"))["prom"] or 0
        return Response({
            "total": total,
            "criticos": por_nivel.get("Crítico", 0),
            "altos": por_nivel.get("Alto", 0),
            "medios": por_nivel.get("Medio", 0),
            "bajos": por_nivel.get("Bajo", 0),
            "va_promedio": round(va_promedio, 2),
            "por_nivel": por_nivel,
            "por_tipo": por_tipo,
        })
