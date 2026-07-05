from rest_framework import permissions, viewsets

from .models import MarcoReferencia, Organizacion
from .serializers import MarcoReferenciaSerializer, OrganizacionSerializer


class OrganizacionViewSet(viewsets.ModelViewSet):
    queryset = Organizacion.objects.prefetch_related("marcos").all()
    serializer_class = OrganizacionSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class MarcoReferenciaViewSet(viewsets.ModelViewSet):
    queryset = MarcoReferencia.objects.all()
    serializer_class = MarcoReferenciaSerializer
    permission_classes = [permissions.AllowAny]
