from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Escenario, EscenarioRiesgo
from .serializers import (
    EscenarioRiesgoSerializer, EscenarioSerializer,
)
from .services import montecarlo as mc


class ReadOnlyOrAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class EscenarioViewSet(viewsets.ModelViewSet):
    """Escenarios legacy (dashboard actual)."""
    queryset = Escenario.objects.select_related("organizacion").all()
    serializer_class = EscenarioSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["nivel", "organizacion"]
    search_fields = ["codigo", "nombre", "activos"]
    ordering_fields = ["rr", "ale_pert", "codigo"]

    @action(detail=True, methods=["get"])
    def simular(self, request, pk=None):
        esc = self.get_object()
        n = request.query_params.get("n", 10000)
        return Response(esc.simular(n))

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        total_ale = sum(e.ale_pert or 0 for e in qs)
        return Response({
            "total": qs.count(),
            "criticos": qs.filter(nivel="Crítico").count(),
            "altos": qs.filter(nivel="Alto").count(),
            "medios": qs.filter(nivel="Medio").count(),
            "ale_total": round(total_ale),
        })


class EscenarioRiesgoViewSet(viewsets.ModelViewSet):
    """Escenarios del wizard de 8 pasos (FK a activo/amenaza/vulnerabilidad/control)."""
    queryset = (EscenarioRiesgo.objects
                .select_related("organizacion", "activo", "amenaza", "vulnerabilidad", "control_existente")
                .prefetch_related("controles_propuestos").all())
    serializer_class = EscenarioRiesgoSerializer
    permission_classes = [ReadOnlyOrAuth]
    filterset_fields = ["nivel", "estado", "organizacion", "estrategia_tratamiento"]
    search_fields = ["codigo", "nombre"]
    ordering_fields = ["rr_simple", "ale_pert_usd", "creado_en"]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(creado_por=user)

    @action(detail=True, methods=["patch"])
    def tef(self, request, pk=None):
        """Paso 4: guarda los TEF del analista y su justificación."""
        esc = self.get_object()
        for campo in ("tef_o_analista", "tef_mp_analista", "tef_p_analista",
                      "justificacion_tef", "consulta_ia_tef", "fuentes_tef"):
            if campo in request.data:
                setattr(esc, campo, request.data[campo])
        if esc.estado == "borrador":
            esc.estado = "tef_pendiente"
        esc.save()
        return Response(self.get_serializer(esc).data)

    @action(detail=True, methods=["post"])
    def calcular(self, request, pk=None):
        """Paso 5: ejecuta fórmulas MAGERIT + Monte Carlo y persiste resultados."""
        esc = self.get_object()
        n = int(request.data.get("n", 10000))
        sim = esc.recalcular(n=n)
        data = self.get_serializer(esc).data
        data["simulacion"] = sim
        return Response(data)

    @action(detail=True, methods=["patch"])
    def tratamiento(self, request, pk=None):
        """Paso 7: guarda la estrategia, controles propuestos y decisión."""
        esc = self.get_object()
        for campo in ("estrategia_tratamiento", "sugerencia_ia_tratamiento",
                      "costo_control_estimado_usd", "roi_estimado",
                      "decision_analista", "aprobado_por"):
            if campo in request.data:
                setattr(esc, campo, request.data[campo])
        if "controles_propuestos" in request.data:
            esc.controles_propuestos.set(request.data["controles_propuestos"])
        if esc.estado in ("calculado", "evaluado"):
            esc.estado = "en_tratamiento"
        esc.save()
        return Response(self.get_serializer(esc).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            "total": qs.count(),
            "criticos": qs.filter(nivel="critico").count(),
            "altos": qs.filter(nivel="alto").count(),
            "medios": qs.filter(nivel="medio").count(),
            "bajos": qs.filter(nivel="bajo").count(),
            "ale_total": round(sum(e.ale_pert_usd or 0 for e in qs)),
            "ale_p90_total": round(sum(e.ale_p90_usd or 0 for e in qs)),
        })


class CatalogoLMView(viewsets.ViewSet):
    """Expone la tabla LM por impacto usada por el motor (para la UI)."""
    permission_classes = [ReadOnlyOrAuth]

    def list(self, request):
        return Response(mc.LM_POR_IMPACTO)
