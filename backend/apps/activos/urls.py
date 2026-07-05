from rest_framework.routers import DefaultRouter

from .views import ActivoViewSet, ProcesoNegocioViewSet, TipoActivoViewSet

router = DefaultRouter()
router.register("activos", ActivoViewSet, basename="activos")
router.register("tipos-activo", TipoActivoViewSet, basename="tipos-activo")
router.register("procesos", ProcesoNegocioViewSet, basename="procesos")

urlpatterns = router.urls
