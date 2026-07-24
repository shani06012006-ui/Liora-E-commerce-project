import calendar
from datetime import timedelta
 
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from django.utils.text import slugify
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
 
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
 
User = get_user_model()
 
 
class AdminDashboardStatsView(APIView):
    permission_classes = (IsAuthenticated,)
 
    def get(self, request):
        try:
            
            if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
                return Response({"error": "Access denied."}, status=403)
 
            total_users = User.objects.count()
            total_products = Product.objects.count()
 
            try:
                from orders.models import Order
                total_orders = Order.objects.count()
                pending_orders = Order.objects.filter(status='pending').count()
                completed_orders = Order.objects.filter(status='delivered').count()
 
                today = timezone.now().date()
                today_orders = Order.objects.filter(created_at__date=today).count()
 
                last_30_days = timezone.now() - timedelta(days=30)
                revenue_data = Order.objects.filter(
                    created_at__gte=last_30_days,
                    status='delivered'
                ).aggregate(total=Sum('total_amount'))
                revenue = float(revenue_data['total'] or 0)
 
                recent_orders = Order.objects.order_by('-created_at')[:10]
                recent_orders_data = []
                for order in recent_orders:
                    recent_orders_data.append({
                        'id': order.id,
                        'order_number': order.order_number,
                        'user_name': order.user.username,
                        'total_amount': float(order.total_amount),
                        'status': order.status,
                        'created_at': order.created_at.isoformat()
                    })
            except Exception:  # noqa: BLE001
                total_orders = 0
                pending_orders = 0
                completed_orders = 0
                today_orders = 0
                revenue = 0
                recent_orders_data = []
 
            try:
                from reviews.models import Review
                total_reviews = Review.objects.count()
            except Exception:  # noqa: BLE001 
                total_reviews = 0
 
            # Product stats
            in_stock = Product.objects.filter(stock__gt=10).count()
            low_stock = Product.objects.filter(stock__gt=0, stock__lte=10).count()
            out_of_stock = Product.objects.filter(stock=0).count()
 
            # Popular products
            popular_products_data = []
            try:
                popular_products = Product.objects.annotate(
                    total_sold=Sum('orderitem__quantity')
                ).order_by('-total_sold')[:5]
                popular_products_data = ProductSerializer(popular_products, many=True).data
            except Exception:  # noqa: BLE001 - fall back if orderitem relation is unavailable
                popular_products = Product.objects.all().order_by('-created_at')[:5]
                popular_products_data = ProductSerializer(popular_products, many=True).data
 
            top_categories_data = []
            try:
                top_categories = Category.objects.annotate(
                    product_count=Count('products')
                ).order_by('-product_count')[:5]
                top_categories_data = [
                    {'name': cat.name, 'count': cat.product_count}
                    for cat in top_categories
                ]
            except Exception:  # noqa: BLE001
                top_categories = Category.objects.all()[:5]
                top_categories_data = [
                    {'name': cat.name, 'count': 0}
                    for cat in top_categories
                ]
 
            # Low stock products
            low_stock_products = Product.objects.filter(
                stock__gt=0,
                stock__lte=10
            ).order_by('stock')[:5]
            low_stock_products_data = ProductSerializer(low_stock_products, many=True).data

            revenue_period = request.query_params.get('revenue_period', 'week')
            revenue_trend = []
            try:
                from orders.models import Order as RevenueOrder
                now = timezone.now()
 
                if revenue_period == 'week':
                    start = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
                    daily = (
                        RevenueOrder.objects.filter(created_at__gte=start, status='delivered')
                        .annotate(day=TruncDate('created_at'))
                        .values('day')
                        .annotate(revenue=Sum('total_amount'))
                    )
                    revenue_by_day = {row['day']: float(row['revenue'] or 0) for row in daily}
                    for i in range(7):
                        d = (start + timedelta(days=i)).date()
                        revenue_trend.append({
                            'label': d.strftime('%a'),
                            'revenue': round(revenue_by_day.get(d, 0), 2),
                        })
 
                elif revenue_period == 'month':
                    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    days_in_month = calendar.monthrange(now.year, now.month)[1]
                    last_day = min(now.day, days_in_month)
                    daily = (
                        RevenueOrder.objects.filter(created_at__gte=start, status='delivered')
                        .annotate(day=TruncDate('created_at'))
                        .values('day')
                        .annotate(revenue=Sum('total_amount'))
                    )
                    revenue_by_day = {row['day']: float(row['revenue'] or 0) for row in daily}
                    num_weeks = (last_day + 6) // 7
                    for w in range(num_weeks):
                        week_start_day = w * 7 + 1
                        week_end_day = min(week_start_day + 6, last_day)
                        week_revenue = sum(
                            revenue_by_day.get(start.replace(day=d).date(), 0)
                            for d in range(week_start_day, week_end_day + 1)
                        )
                        revenue_trend.append({
                            'label': f'Week {w + 1}',
                            'revenue': round(week_revenue, 2),
                        })
 
                elif revenue_period == 'year':
                    start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                    monthly = (
                        RevenueOrder.objects.filter(created_at__gte=start, status='delivered')
                        .annotate(month=TruncMonth('created_at'))
                        .values('month')
                        .annotate(revenue=Sum('total_amount'))
                    )
                    revenue_by_month = {row['month'].month: float(row['revenue'] or 0) for row in monthly}
                    months_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    for m in range(1, now.month + 1):
                        revenue_trend.append({
                            'label': months_short[m - 1],
                            'revenue': round(revenue_by_month.get(m, 0), 2),
                        })
            except Exception:  # noqa: BLE001
                revenue_trend = []
 
            response_data = {
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
                'today_orders': today_orders,
                'recent_orders': recent_orders_data,
                'popular_products': popular_products_data,
                'top_categories': top_categories_data,
                'low_stock_products': low_stock_products_data,
                'revenue_trend': revenue_trend,
 
                'confirmed_orders': Order.objects.filter(status='confirmed').count(),
                'packed_orders': Order.objects.filter(status='packed').count(),
                'shipped_orders': Order.objects.filter(status='shipped').count(),
                'cancelled_orders': Order.objects.filter(status='cancelled').count(),
            }
 
            return Response(response_data)
 
        except Exception as error:  # noqa: BLE001
            return Response(
                {
                    "error": str(error),
                    "message": "Failed to load dashboard data."
                },
                status=500
            )
 
 
class ProductViewSet(ModelViewSet):
    """Customer-facing browse endpoint — read-only, public."""
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    http_method_names = ('get', 'head')
 
    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__slug=category)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs.order_by('-created_at')
 
 
class AdminProductListView(APIView):
    permission_classes = (IsAuthenticated,)
 
    def get(self, request):
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
    permission_classes = (IsAuthenticated,)
 
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
 
        product.delete()
 
        return Response({"message": "Product deactivated."}, status=204)
 
 
class PublicCategoryListView(APIView):
    """Public, read-only category list for the storefront (nav bars, filters)."""
    permission_classes = (AllowAny,)
 
    def get(self, request):
        categories = Category.objects.filter(is_active=True).order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
 
 
class AdminCategoryListView(APIView):
    permission_classes = (IsAuthenticated,)
 
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
 
        data = request.data.copy()
        if not data.get('slug'):
            base_slug = slugify(data.get('name', ''))
            slug = base_slug
            counter = 2
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            data['slug'] = slug
 
        serializer = CategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
 
 
class AdminCategoryDetailView(APIView):
    permission_classes = (IsAuthenticated,)
 
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
 