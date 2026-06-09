from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404   #Product illa nah error
from .models import Cart, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer
from products.models import Product
import uuid  #random unique vale generate panna

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart_items, many=True)
        total = sum(item.total_price() for item in cart_items)
        return Response({'items': serializer.data, 'total': total})
    
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        product = get_object_or_404(Product, id=product_id)
        
        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)
    
    def put(self, request, item_id):
        cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
        cart_item.quantity = request.data.get('quantity', cart_item.quantity)
        cart_item.save()
        return Response({'message': 'Cart updated'})
    
    def delete(self, request, item_id):
        cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
        cart_item.delete()
        return Response({'message': 'Item removed'})

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        if not cart_items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        total = sum(item.total_price() for item in cart_items)
        order_number = str(uuid.uuid4())[:8].upper()
        
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=total,
            shipping_address=request.data.get('shipping_address', request.user.address),
            phone=request.data.get('phone', request.user.phone)
        )
        
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            # Reduce stock
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
        
        cart_items.delete()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)