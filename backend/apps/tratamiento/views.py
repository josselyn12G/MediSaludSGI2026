from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PlanTratamiento
from .serializers import PlanTratamientoSerializer


class ReadOnlyOrAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class PlanTratamientoViewSet(viewsets.ModelViewSet):
    queryset = PlanTratamiento.objects.all()
    serializer_class = PlanTratamientoSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["estrategia", "organizacion"]
    search_fields = ["escenario_codigo", "escenario_nombre"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        actual = sum(p.ale_actual for p in qs)
        objetivo = sum(p.ale_objetivo for p in qs)
        return Response({
            "ale_actual_total": round(actual),
            "ale_objetivo_total": round(objetivo),
            "reduccion_total": round(actual - objetivo),
            "reduccion_pct": round((1 - objetivo / actual) * 100, 1) if actual else 0,
        })
