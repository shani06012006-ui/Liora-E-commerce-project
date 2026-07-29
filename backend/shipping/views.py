from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ShippingCharge
from .serializers import CalculateShippingSerializer, ShippingChargeSerializer


class ShippingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ShippingCharge.objects.filter(is_active=True)
    serializer_class = ShippingChargeSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def calculate(self, request):
        serializer = CalculateShippingSerializer(data=request.data)
        if serializer.is_valid():
            subtotal = serializer.validated_data["subtotal"]

            shipping_charge = (
                ShippingCharge.objects.filter(is_active=True, min_amount__lte=subtotal)
                .order_by("-min_amount")
                .first()
            )

            if (
                shipping_charge
                and shipping_charge.max_amount
                and subtotal > shipping_charge.max_amount
            ):
                shipping_charge = None

            if not shipping_charge or (
                shipping_charge.min_amount == 0 and subtotal >= 999
            ):
                charge = 0  # Free shipping
            else:
                charge = shipping_charge.charge if shipping_charge else 99

            return Response(
                {
                    "shipping_charge": charge,
                    "total": subtotal + charge,
                    "is_free_shipping": charge == 0,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
