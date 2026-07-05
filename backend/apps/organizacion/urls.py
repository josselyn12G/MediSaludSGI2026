from rest_framework.routers import DefaultRouter

from .views import MarcoReferenciaViewSet, OrganizacionViewSet

router = DefaultRouter()
router.register("organizacion", OrganizacionViewSet, basename="organizacion")
router.register("marcos", MarcoReferenciaViewSet, basename="marcos")

urlpatterns = router.urls
