from rest_framework.routers import DefaultRouter

from .views import PlanTratamientoViewSet

router = DefaultRouter()
router.register("planes-tratamiento", PlanTratamientoViewSet, basename="planes-tratamiento")

urlpatterns = router.urls
