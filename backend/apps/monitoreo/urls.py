from rest_framework.routers import DefaultRouter

from .views import CicloMonitoreoViewSet, KPIViewSet, TareaMonitoreoViewSet

router = DefaultRouter()
router.register("kpis", KPIViewSet, basename="kpis")
router.register("ciclos-monitoreo", CicloMonitoreoViewSet, basename="ciclos-monitoreo")
router.register("tareas-monitoreo", TareaMonitoreoViewSet, basename="tareas-monitoreo")

urlpatterns = router.urls