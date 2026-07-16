# backend/admin_analytics/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class AdminAnalyticsTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from orders.models import Order
            from accounts.models import User
            from products.models import Product

            return Response({
                "status": "ok",
                "message": "Analytics module is working",
                "order_count": Order.objects.count(),
                "user_count": User.objects.count(),
                "product_count": Product.objects.count(),
                "is_staff": request.user.is_staff,
                "username": request.user.username
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AdminAnalyticsSalesView(APIView):
    """Sales report analytics for admin"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)

            from orders.models import Order

            range_param = request.query_params.get('range', 'month')
            now = timezone.now()

            # Date range logic
            if range_param == 'today':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'week':
                start_date = now - timedelta(days=7)
            elif range_param == 'month':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'year':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                start_date = now - timedelta(days=30)

            # Get completed orders
            orders = Order.objects.filter(
                created_at__gte=start_date,
                status='delivered'
            )

            if not orders.exists():
                return Response([])

            # Aggregate by date
            sales_data = (
                orders
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(
                    total_sales=Sum('total_amount'),
                    total_orders=Count('id')
                )
                .order_by('date')
            )

            result = []
            for item in sales_data:
                if item['date']:
                    result.append({
                        'date': item['date'].strftime('%Y-%m-%d'),
                        'total_sales': float(item['total_sales'] or 0),
                        'total_orders': item['total_orders']
                    })

            return Response(result)

        except Exception as e:
            logger.error(f"SalesView error: {str(e)}")
            return Response({"error": str(e)}, status=500)


class AdminAnalyticsRevenueView(APIView):
    """Revenue report analytics for admin"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)

            from orders.models import Order

            range_param = request.query_params.get('range', 'month')
            now = timezone.now()

            if range_param == 'today':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'week':
                start_date = now - timedelta(days=7)
            elif range_param == 'month':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'year':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                start_date = now - timedelta(days=30)

            orders = Order.objects.filter(
                created_at__gte=start_date,
                status='delivered'
            )

            if not orders.exists():
                return Response([])

            revenue_data = (
                orders
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(
                    revenue=Sum('total_amount'),
                )
                .order_by('date')
            )

            result = []
            for item in revenue_data:
                if item['date']:
                    revenue = float(item['revenue'] or 0)
                    cost = revenue * 0.6
                    profit = revenue - cost
                    
                    result.append({
                        'date': item['date'].strftime('%Y-%m-%d'),
                        'revenue': round(revenue, 2),
                        'cost': round(cost, 2),
                        'profit': round(profit, 2)
                    })

            return Response(result)

        except Exception as e:
            logger.error(f"RevenueView error: {str(e)}")
            return Response({"error": str(e)}, status=500)


class AdminAnalyticsCustomersView(APIView):
    """Customer report analytics for admin"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)

            from accounts.models import User

            range_param = request.query_params.get('range', 'month')
            segment = request.query_params.get('segment', 'all')
            now = timezone.now()

            if range_param == 'today':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'week':
                start_date = now - timedelta(days=7)
            elif range_param == 'month':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'year':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                start_date = now - timedelta(days=30)

            # Get users with orders in date range
            users = User.objects.filter(
                orders__created_at__gte=start_date,
                orders__status='delivered'
            ).distinct()

            if not users.exists():
                return Response([])

            if segment == 'new':
                users = users.filter(date_joined__gte=start_date)
            elif segment == 'repeat':
                users = users.annotate(order_count=Count('orders')).filter(order_count__gt=1)
            elif segment == 'high':
                users = users.annotate(total_spent=Sum('orders__total_amount')).filter(total_spent__gt=1000)

            result = []
            for user in users[:20]:
                user_orders = user.orders.filter(created_at__gte=start_date, status='delivered')
                total_orders = user_orders.count()
                total_spent = user_orders.aggregate(total=Sum('total_amount'))['total'] or 0

                result.append({
                    'id': user.id,
                    'name': user.full_name or user.username,
                    'email': user.email,
                    'total_orders': total_orders,
                    'total_spent': float(total_spent),
                    'segment': 'VIP' if total_spent > 5000 else 'Regular' if total_orders > 1 else 'New'
                })

            result.sort(key=lambda x: x['total_spent'], reverse=True)
            return Response(result)

        except Exception as e:
            logger.error(f"CustomersView error: {str(e)}")
            return Response({"error": str(e)}, status=500)


class AdminAnalyticsProductsView(APIView):
    """Product performance analytics for admin"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)

            from products.models import Product
            from orders.models import OrderItem

            range_param = request.query_params.get('range', 'month')
            now = timezone.now()

            if range_param == 'today':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'week':
                start_date = now - timedelta(days=7)
            elif range_param == 'month':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif range_param == 'year':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                start_date = now - timedelta(days=30)

            products = Product.objects.all()
            
            if not products.exists():
                return Response([])

            result = []
            for product in products[:20]:
                order_items = OrderItem.objects.filter(
                    product=product,
                    order__created_at__gte=start_date,
                    order__status='delivered'
                )

                total_sales = order_items.aggregate(total=Sum('quantity'))['total'] or 0
                total_revenue = order_items.aggregate(total=Sum(F('price') * F('quantity')))['total'] or 0
                profit = float(total_revenue) * 0.4

                # Simple trend calculation
                trend = 0
                if total_sales > 0:
                    # Compare with previous period
                    time_delta = now - start_date
                    previous_start = start_date - time_delta
                    previous_items = OrderItem.objects.filter(
                        product=product,
                        order__created_at__gte=previous_start,
                        order__created_at__lt=start_date,
                        order__status='delivered'
                    )
                    previous_sales = previous_items.aggregate(total=Sum('quantity'))['total'] or 0
                    if previous_sales > 0:
                        trend = ((total_sales - previous_sales) / previous_sales) * 100

                result.append({
                    'id': product.id,
                    'name': product.name,
                    'category': product.category.name if hasattr(product, 'category') and product.category else 'Uncategorized',
                    'image_url': product.image.url if hasattr(product, 'image') and product.image else None,
                    'sales': total_sales,
                    'revenue': float(total_revenue),
                    'profit': profit,
                    'trend': float(trend)
                })

            result.sort(key=lambda x: x['revenue'], reverse=True)
            return Response(result)

        except Exception as e:
            logger.error(f"ProductsView error: {str(e)}")
            return Response({"error": str(e)}, status=500)