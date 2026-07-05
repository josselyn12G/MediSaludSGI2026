"""Proxy seguro hacia la API de OpenAI (ChatGPT).

El frontend NUNCA llama a OpenAI directamente. Envía aquí { tipo, payload,
openai_key } y este proxy:
  1. Construye el prompt adecuado según `tipo` (prompts.py).
  2. Llama a OpenAI con la key del analista (no se persiste).
  3. Devuelve { respuesta, modelo } al cliente.

Se usa urllib de la stdlib para no añadir dependencias nuevas.
"""
import json
import urllib.error
import urllib.request

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .prompts import BUILDERS, SYSTEM_BASE

OPENAI_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o-mini"
TIMEOUT_S = 90
# Límite de tokens de salida por tipo (respuestas concisas = menos consumo)
MAX_TOKENS = {"tef_contexto": 320, "sugerencia_tratamiento": 650, "informe_ejecutivo": 900, "resumen_escenario": 240}


def _call_openai(api_key, model, system, user, max_tokens=400):
    body = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.3,
        "max_tokens": max_tokens,
    }).encode("utf-8")

    req = urllib.request.Request(
        OPENAI_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def consultar(request):
    tipo = request.data.get("tipo")
    payload = request.data.get("payload", {}) or {}
    api_key = (request.data.get("openai_key") or "").strip()
    model = request.data.get("modelo") or DEFAULT_MODEL

    if tipo not in BUILDERS:
        return Response(
            {"error": f"Tipo de consulta no soportado: '{tipo}'. "
                      f"Válidos: {', '.join(BUILDERS)}."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not api_key:
        return Response(
            {"error": "Falta la API key de OpenAI. Configúrala en la pantalla de "
                      "ajustes (se guarda solo en tu navegador, no en el servidor)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_prompt = BUILDERS[tipo](payload)

    try:
        respuesta = _call_openai(api_key, model, SYSTEM_BASE, user_prompt, MAX_TOKENS.get(tipo, 400))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")
        msg = "API key inválida o sin saldo." if e.code in (401, 429) else f"Error OpenAI {e.code}."
        return Response({"error": msg, "detalle": detail[:500]},
                        status=status.HTTP_502_BAD_GATEWAY)
    except urllib.error.URLError as e:
        return Response({"error": f"No se pudo contactar a OpenAI: {e.reason}"},
                        status=status.HTTP_504_GATEWAY_TIMEOUT)
    except (KeyError, IndexError, ValueError):
        return Response({"error": "Respuesta inesperada de OpenAI."},
                        status=status.HTTP_502_BAD_GATEWAY)

    return Response({"respuesta": respuesta, "modelo": model, "tipo": tipo})
