from django.contrib import admin

from .models import Amenaza, Control, GrupoAmenaza, Vulnerabilidad


@admin.register(GrupoAmenaza)
class GrupoAmenazaAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre")


@admin.register(Amenaza)
class AmenazaAdmin(admin.ModelAdmin):
    list_display = ("id_magerit", "nombre", "grupo", "tef_pert", "nivel_probabilidad", "es_critica_lopdp")
    list_filter = ("grupo", "es_critica_lopdp", "tipo")
    search_fields = ("id_magerit", "nombre")


@admin.register(Vulnerabilidad)
class VulnerabilidadAdmin(admin.ModelAdmin):
    list_display = ("id_vuln", "nombre", "tipo", "severidad", "degradacion")
    list_filter = ("tipo", "severidad")
    search_fields = ("id_vuln", "nombre")


@admin.register(Control)
class ControlAdmin(admin.ModelAdmin):
    list_display = ("id_control", "nombre", "referencia_iso", "estado", "frc")
    list_filter = ("estado",)
    search_fields = ("id_control", "nombre")
