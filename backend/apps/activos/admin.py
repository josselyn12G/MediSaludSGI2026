from django.contrib import admin

from .models import Activo, ProcesoNegocio, TipoActivo


@admin.register(TipoActivo)
class TipoActivoAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "formula", "dimensiones_extra")


@admin.register(ProcesoNegocio)
class ProcesoNegocioAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "responsable", "nivel_importancia")


@admin.register(Activo)
class ActivoAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "tipo", "va_normalizado",
                    "nivel_criticidad", "clasificacion_nc")
    list_filter = ("nivel_criticidad", "tipo", "estado")
    search_fields = ("codigo", "nombre")
