from django.urls import path

from . import views

urlpatterns = [
    path("contexto/", views.contexto_completo, name="contexto-completo"),
    path("contexto/organizacion/", views.get_organizacion, name="contexto-organizacion"),
    path("contexto/impacto/", views.get_impacto, name="contexto-impacto"),
    path("contexto/probabilidad/", views.get_probabilidad, name="contexto-probabilidad"),
    path("contexto/aceptacion/", views.get_aceptacion, name="contexto-aceptacion"),
    path("contexto/mapa-calor/", views.get_mapa_calor, name="contexto-mapa-calor"),
    path("contexto/formulas/", views.get_formulas, name="contexto-formulas"),
]
