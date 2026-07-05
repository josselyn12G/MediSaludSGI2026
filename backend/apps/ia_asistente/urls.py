from django.urls import path

from . import views

urlpatterns = [
    path("ia/consultar/", views.consultar, name="ia-consultar"),
]
