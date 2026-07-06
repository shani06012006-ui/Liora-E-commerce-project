import uuid
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer
from products.models import Product

User = get_user_model()

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(items, many=True)
        total = sum(item.total_price() for item in items)
        return Response({"items": serializer.data, "total": total})

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(Product, id=product_id, is_active=True)

        if product.stock < quantity:
            return Response({"error": f"Only {product.stock} left in stock."}, status=400)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user, product=product, defaults={"quantity": quantity}
        )

        if not created:
            new_qty = cart_item.quantity + quantity
            if product.stock < new_qty:
                return Response({"error": f"Only {product.stock} left in stock."}, status=400)
            cart_item.quantity = new_qty
            cart_item.save()

        return Response({"message": "Cart updated"}, status=201)

    def put(self, request, item_id):
        item = get_object_or_404(Cart, id=item_id, user=request.user)
        new_qty = int(request.data.get("quantity", item.quantity))
        if item.product.stock < new_qty:
            return Response({"error": f"Only {item.product.stock} left in stock."}, status=400)
        item.quantity = new_qty
        item.save()
        return Response({"message": "Updated"})

    def delete(self, request, item_id):
        item = get_object_or_404(Cart, id=item_id, user=request.user)
        item.delete()
        return Response({"message": "Removed"})


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_items = Cart.objects.filter(user=request.user)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response(
                    {"error": f"Not enough stock for {item.product.name}"}, status=400
                )

        total = sum(item.total_price() for item in cart_items)
        order_number = str(uuid.uuid4())[:8].upper()

        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=total,
            shipping_address=request.data.get("shipping_address", request.user.address),
            phone=request.data.get("phone", request.user.phone),
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            item.product.stock -= item.quantity
            item.product.save()

        cart_items.delete()
        return Response(OrderSerializer(order).data, status=201)


class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
        return Response(OrderSerializer(orders, many=True).data)


class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Access denied"}, status=403)

        orders = Order.objects.all().order_by("-created_at")

        status_filter = request.query_params.get("status")
        if status_filter:
            orders = orders.filter(status=status_filter)

        search = request.query_params.get("search")
        if search:
            orders = orders.filter(order_number__icontains=search)

        return Response(OrderSerializer(orders, many=True).data)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, order_id):
        return get_object_or_404(Order, id=order_id)

    def get(self, request, order_id):
        if request.user.role != "admin":
            return Response({"error": "Access denied"}, status=403)
        order = self.get_object(order_id)
        return Response(OrderSerializer(order).data)

    def patch(self, request, order_id):
        if request.user.role != "admin":
            return Response({"error": "Access denied"}, status=403)

        order = self.get_object(order_id)
        status_value = request.data.get("status")

        if status_value:
            order.status = status_value
            try:
                order.save()
            except ValidationError as e:
                return Response({"error": e.messages}, status=400)

        return Response(OrderSerializer(order).data)

    def delete(self, request, order_id):
        if request.user.role != "admin":
            return Response({"error": "Access denied"}, status=403)
        order = self.get_object(order_id)
        order.delete()
        return Response({"message": "Deleted"}, status=204)


class BuyNowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(Product, id=product_id, is_active=True)

        if product.stock < quantity:
            return Response({"error": "Insufficient stock"}, status=400)

        order_number = str(uuid.uuid4())[:8].upper()

        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=product.price * quantity,
            shipping_address=request.data.get("shipping_address", request.user.address),
            phone=request.data.get("phone", request.user.phone),
        )

        OrderItem.objects.create(order=order, product=product, quantity=quantity, price=product.price)

        product.stock -= quantity
        product.save()

        return Response(OrderSerializer(order).data, status=201)