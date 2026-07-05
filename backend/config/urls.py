from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import EmailTokenObtainPairView, RegisterView, MeView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Auth
    path("api/auth/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/me/", MeView.as_view(), name="me"),
    # Modules
    path("api/", include("apps.contexto.urls")),
    path("api/", include("apps.ia_asistente.urls")),
    path("api/", include("apps.organizacion.urls")),
    path("api/", include("apps.activos.urls")),
    path("api/", include("apps.amenazas.urls")),
    path("api/", include("apps.riesgos.urls")),
    path("api/", include("apps.tratamiento.urls")),
    path("api/", include("apps.monitoreo.urls")),
]
