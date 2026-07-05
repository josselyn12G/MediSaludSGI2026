from django.contrib import admin

from .models import MarcoReferencia, Organizacion


@admin.register(Organizacion)
class OrganizacionAdmin(admin.ModelAdmin):
    list_display = ("nombre", "sector", "ciudad", "num_empleados")


@admin.register(MarcoReferencia)
class MarcoReferenciaAdmin(admin.ModelAdmin):
    list_display = ("norma", "organizacion", "orden")
