"""Endpoints de solo lectura (GET) que exponen los parámetros fijos de la
Fase 1. No se permite POST/PUT/DELETE: el contexto es inmutable.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .constants import (
    CRITERIOS_ACEPTACION,
    CRITERIOS_IMPACTO,
    CRITERIOS_PROBABILIDAD,
    FORMULAS,
    MAPA_CALOR,
    ORGANIZACION_CONTEXTO,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def contexto_completo(request):
    """Devuelve todo el contexto de la Fase 1 en una sola respuesta."""
    return Response({
        "organizacion": ORGANIZACION_CONTEXTO,
        "criterios_impacto": CRITERIOS_IMPACTO,
        "criterios_probabilidad": CRITERIOS_PROBABILIDAD,
        "criterios_aceptacion": CRITERIOS_ACEPTACION,
        "mapa_calor": MAPA_CALOR,
        "formulas": FORMULAS,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_organizacion(request):
    return Response(ORGANIZACION_CONTEXTO)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_impacto(request):
    return Response(CRITERIOS_IMPACTO)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_probabilidad(request):
    return Response(CRITERIOS_PROBABILIDAD)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_aceptacion(request):
    return Response(CRITERIOS_ACEPTACION)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_mapa_calor(request):
    return Response(MAPA_CALOR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_formulas(request):
    return Response(FORMULAS)
