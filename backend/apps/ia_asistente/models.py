"""El asistente IA es un proxy sin estado: no persiste modelos.

La API key de OpenAI la provee el analista en cada petición (se guarda solo en
sessionStorage del navegador, nunca en la base de datos). Las respuestas
relevantes se guardan dentro de los modelos de `riesgos` (EscenarioRiesgo,
InformeEjecutivo), no aquí.
"""
