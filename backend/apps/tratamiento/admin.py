from django.contrib import admin

from .models import PlanTratamiento


@admin.register(PlanTratamiento)
class PlanTratamientoAdmin(admin.ModelAdmin):
    list_display = ("escenario_codigo", "estrategia", "ale_actual", "ale_objetivo")
    list_filter = ("estrategia",)
