from django.contrib import admin

from .models import KPI, CicloMonitoreo


@admin.register(KPI)
class KPIAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "linea_base", "meta", "frecuencia")


@admin.register(CicloMonitoreo)
class CicloMonitoreoAdmin(admin.ModelAdmin):
    list_display = ("frecuencia", "nivel_riesgo_aplicable", "responsable", "orden")
    ordering = ("orden",)