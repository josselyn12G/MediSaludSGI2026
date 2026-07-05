from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UsuarioManager(BaseUserManager):
    """Manager that uses email as the unique identifier."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("rol", "admin")
        return self._create_user(email, password, **extra_fields)


class Usuario(AbstractUser):
    ROLES = [
        ("admin", "Administrador"),
        ("analista", "Analista de Riesgos"),
        ("auditor", "Auditor"),
        ("viewer", "Solo lectura"),
    ]

    username = None  # we authenticate by email
    email = models.EmailField("correo electrónico", unique=True)
    organizacion = models.ForeignKey(
        "organizacion.Organizacion",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="usuarios",
    )
    rol = models.CharField(max_length=20, choices=ROLES, default="analista")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UsuarioManager()

    def __str__(self):
        return self.email
