from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Cart, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer
from products.models import Product
import uuid
 
User = get_user_model()

class CartView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart_items, many=True)
        total = sum(item.total_price() for item in cart_items)
        return Response({'items': serializer.data, 'total': total})
 
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity   = request.data.get('quantity', 1)
        product    = get_object_or_404(Product, id=product_id)
 
        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
 
        if not created:
            return Response(
                {'message': 'Already in cart', 'already_exists': True},
                status=status.HTTP_200_OK
            )
 
        return Response(
            {'message': 'Item added to cart'},
            status=status.HTTP_201_CREATED
        )
 
    def put(self, request, item_id):
        cart_item          = get_object_or_404(Cart, id=item_id, user=request.user)
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
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        total        = sum(item.total_price() for item in cart_items)
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
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
 
        cart_items.delete()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
 
 
class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        orders     = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    
class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def patch(self, request, order_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, order_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)
        order.delete()
        return Response({"message": "Order deleted."}, status=204)
    
class BuyNowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'Product ID required'}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        if product.stock < quantity:
            return Response({'error': 'Insufficient stock'}, status=400)

        total        = product.price * quantity
        order_number = str(uuid.uuid4())[:8].upper()

        order = Order.objects.create(
            user             = request.user,
            order_number     = order_number,
            total_amount     = total,
            shipping_address = request.data.get('shipping_address', request.user.address),
            phone            = request.data.get('phone', request.user.phone),
            payment_method   = request.data.get('payment_method', 'cod'),
        )

        OrderItem.objects.create(
            order    = order,
            product  = product,
            quantity = quantity,
            price    = product.price,
        )

        product.stock -= quantity
        product.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)        