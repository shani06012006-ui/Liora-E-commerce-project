from rest_framework import serializers
from .models import Cart, Order, OrderItem
from products.serializers import ProductSerializer


class CartSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    product_image = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'product', 'product_details',
            'product_image', 'quantity', 'total'
        ]

    def get_total(self, obj):
        return obj.total_price()

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            return obj.product.image.url
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name',
            'product_image', 'quantity', 'price'
        ]

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            return obj.product.image.url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number',
            'user_name',
            'total_amount',
            'status',
            'payment_status',
            'shipping_address',
            'phone',
            'created_at',
            'updated_at',
            'items'
        ]