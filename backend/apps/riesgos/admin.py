from django.contrib import admin

from .models import Escenario


@admin.register(Escenario)
class EscenarioAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "p", "i", "rr", "nivel", "ale_pert")
    list_filter = ("nivel",)
