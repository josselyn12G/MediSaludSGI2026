from rest_framework.routers import DefaultRouter

from .views import (
    AmenazaViewSet, ControlViewSet, GrupoAmenazaViewSet, VulnerabilidadViewSet,
)

router = DefaultRouter()
router.register("grupos-amenaza", GrupoAmenazaViewSet, basename="grupos-amenaza")
router.register("amenazas", AmenazaViewSet, basename="amenazas")
router.register("vulnerabilidades", VulnerabilidadViewSet, basename="vulnerabilidades")
router.register("controles", ControlViewSet, basename="controles")

urlpatterns = router.urls
