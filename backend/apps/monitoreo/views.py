from rest_framework import permissions, viewsets

from .models import KPI, CicloMonitoreo, TareaMonitoreo
from .serializers import CicloMonitoreoSerializer, KPISerializer, TareaMonitoreoSerializer


class ReadOnlyOrAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class KPIViewSet(viewsets.ModelViewSet):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer
    permission_classes = [ReadOnlyOrAuth]
    search_fields = ["codigo", "nombre"]


class CicloMonitoreoViewSet(viewsets.ModelViewSet):
    queryset = CicloMonitoreo.objects.all()
    serializer_class = CicloMonitoreoSerializer
    permission_classes = [ReadOnlyOrAuth]


class TareaMonitoreoViewSet(viewsets.ModelViewSet):
    queryset = TareaMonitoreo.objects.all()
    serializer_class = TareaMonitoreoSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["escenario", "completada", "organizacion"]