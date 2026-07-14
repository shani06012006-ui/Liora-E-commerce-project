from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from reviews.models import Review
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_reviews = Review.objects.count()
        
        in_stock = Product.objects.filter(stock__gt=10).count()
        low_stock = Product.objects.filter(stock__gt=0, stock__lte=10).count()
        out_of_stock = Product.objects.filter(stock=0).count()
        
        pending_orders = Order.objects.filter(status='pending').count()
        completed_orders = Order.objects.filter(status='delivered').count()
        
        last_30_days = timezone.now() - timedelta(days=30)
        revenue = Order.objects.filter(
            created_at__gte=last_30_days,
            status='delivered'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        recent_orders = Order.objects.order_by('-created_at')[:10]
        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'user_name': order.user.username,
                'total_amount': order.total_amount,
                'status': order.status,
                'created_at': order.created_at
            })
        
        popular_products = Product.objects.annotate(
            total_sold=Sum('orderitem__quantity')
        ).order_by('-total_sold')[:5]
        popular_products_data = ProductSerializer(popular_products, many=True).data
        
        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_reviews': total_reviews,
            'in_stock': in_stock,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'monthly_revenue': revenue,
            'recent_orders': recent_orders_data,
            'popular_products': popular_products_data
        })

class ProductViewSet(ModelViewSet):
    """Customer-facing browse endpoint — read-only, public."""
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'head']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs.order_by('-created_at')


class AdminProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check both role and is_staff
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        products = Product.objects.all().order_by('-created_at')

        search = request.query_params.get('search')
        if search:
            products = products.filter(name__icontains=search)

        is_active = request.query_params.get('is_active')
        if is_active is not None:
            products = products.filter(is_active=is_active.lower() == 'true')

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class AdminProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        return Response(ProductSerializer(product).data)

    def patch(self, request, product_id):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, product_id):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        product.is_active = False
        product.save()
        return Response({"message": "Product deactivated."}, status=204)


class AdminCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        categories = Category.objects.all().order_by('name')

        search = request.query_params.get('search')
        if search:
            categories = categories.filter(name__icontains=search)

        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, category_id):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=404)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, category_id):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response({"error": "Access denied."}, status=403)
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=404)
        category.delete()
        return Response({"message": "Category deleted."}, status=204)