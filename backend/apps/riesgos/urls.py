from rest_framework.routers import DefaultRouter

from .views import CatalogoLMView, EscenarioRiesgoViewSet, EscenarioViewSet

router = DefaultRouter()
router.register("escenarios", EscenarioViewSet, basename="escenarios")
router.register("escenarios-riesgo", EscenarioRiesgoViewSet, basename="escenarios-riesgo")
router.register("lm-impacto", CatalogoLMView, basename="lm-impacto")

urlpatterns = router.urls
