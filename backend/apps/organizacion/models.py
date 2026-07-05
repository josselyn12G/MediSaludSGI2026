from django.db import models


class Organizacion(models.Model):
    nombre = models.CharField(max_length=200)
    sector = models.CharField(max_length=100)
    pais = models.CharField(max_length=100, default="Ecuador")
    ciudad = models.CharField(max_length=100)
    tipo = models.CharField(max_length=100)
    num_empleados = models.IntegerField(default=0)
    num_usuarios_sistemas = models.IntegerField(default=0)
    num_pacientes_registrados = models.IntegerField(null=True, blank=True)
    centros_atencion = models.CharField(max_length=200, blank=True)
    modalidad_operacion = models.CharField(max_length=300, blank=True)
    responsable_evaluacion = models.CharField(max_length=200)
    responsable_seguridad = models.CharField(max_length=200)
    responsable_cumplimiento = models.CharField(max_length=200)
    regulaciones_aplicables = models.TextField(blank=True)
    fecha_levantamiento = models.DateField()
    horizonte_evaluacion_meses = models.IntegerField(default=12)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Organización"
        verbose_name_plural = "Organizaciones"

    def __str__(self):
        return self.nombre


class MarcoReferencia(models.Model):
    """Capa normativa/técnica (sección 3 del documento)."""

    organizacion = models.ForeignKey(
        Organizacion, on_delete=models.CASCADE, related_name="marcos"
    )
    norma = models.CharField(max_length=120)
    elemento_incorporado = models.TextField()
    aplicacion = models.TextField()
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ["orden"]

    def __str__(self):
        return self.norma
