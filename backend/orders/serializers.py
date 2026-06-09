from rest_framework import serializers
from .models import Cart, Order, OrderItem
from products.serializers import ProductSerializer

class CartSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    product_image = serializers.SerializerMethodField()   #custom filed
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'product', 'product_details', 'product_image', 'quantity', 'total']
    
    def get_total(self, obj):
        return obj.total_price()
    
    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            return f"http://localhost:8000/media/{obj.product.image}"
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']
    
    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            return f"http://localhost:8000/media/{obj.product.image}"
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'total_amount', 'status', 
                 'shipping_address', 'phone', 'created_at', 'updated_at', 'items']