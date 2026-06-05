from rest_framework import serializers
from .models import ShippingCharge

class ShippingChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingCharge
        fields = '__all__'

class CalculateShippingSerializer(serializers.Serializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)