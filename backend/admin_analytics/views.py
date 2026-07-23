import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
 
logger = logging.getLogger(__name__)
 
 
def get_date_range(range_param, now):
    """Shared date-range resolver used by every analytics endpoint."""
    if range_param == 'today':
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif range_param == 'week':
        return now - timedelta(days=7)
    elif range_param == 'month':
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif range_param == 'year':
        return now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    return now - timedelta(days=30)
 
 
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
    """Sales report analytics for admin — real order totals grouped by day."""
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)
 
            from orders.models import Order
 
            range_param = request.query_params.get('range', 'month')
            now = timezone.now()
            start_date = get_date_range(range_param, now)
 
            orders = Order.objects.filter(
                created_at__gte=start_date,
                status='delivered'
            )
 
            if not orders.exists():
                return Response([])
 
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
    """
    Revenue report analytics for admin.
 
    Cost/profit are computed from each product's real `cost_price` (set by the
    admin on the product form). If a product has no cost_price recorded, its
    cost is treated as unknown/zero profit for that line rather than guessing
    a made-up margin — so numbers here are never fabricated.
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)
 
            from orders.models import OrderItem
 
            range_param = request.query_params.get('range', 'month')
            now = timezone.now()
            start_date = get_date_range(range_param, now)
 
            items = (
                OrderItem.objects
                .filter(order__created_at__gte=start_date, order__status='delivered')
                .select_related('order', 'product')
                .annotate(date=TruncDate('order__created_at'))
                .order_by('date')
            )
 
            if not items.exists():
                return Response([])
 
            by_date = {}
            for item in items:
                d = item.date
                if d is None:
                    continue
                bucket = by_date.setdefault(d, {'revenue': 0.0, 'cost': 0.0})
 
                line_revenue = float(item.price) * item.quantity
                # Use the recorded cost_price when we have it; otherwise we
                # don't know the real cost, so don't invent a profit margin.
                if item.product and item.product.cost_price is not None:
                    line_cost = float(item.product.cost_price) * item.quantity
                else:
                    line_cost = line_revenue
 
                bucket['revenue'] += line_revenue
                bucket['cost'] += line_cost
 
            result = []
            for d in sorted(by_date.keys()):
                revenue = by_date[d]['revenue']
                cost = by_date[d]['cost']
                profit = revenue - cost
                result.append({
                    'date': d.strftime('%Y-%m-%d'),
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
            start_date = get_date_range(range_param, now)
 
            # Get users with delivered orders in date range.
            # `orders` is Order.user's related_name (see orders/models.py).
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
    """
    Product performance analytics for admin.
 
    Profit is computed from each product's real `cost_price`, not a guessed
    margin. Products are ranked by actual revenue across the full catalog
    before trimming to the top 20, so a best-seller can never get cut off
    just because of its database id.
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)
 
            from products.models import Product
            from orders.models import OrderItem
 
            range_param = request.query_params.get('range', 'month')
            now = timezone.now()
            start_date = get_date_range(range_param, now)
            time_delta = now - start_date
            previous_start = start_date - time_delta
 
            products = Product.objects.all()
 
            if not products.exists():
                return Response([])
 
            result = []
            for product in products:
                order_items = OrderItem.objects.filter(
                    product=product,
                    order__created_at__gte=start_date,
                    order__status='delivered'
                )
 
                total_sales = order_items.aggregate(total=Sum('quantity'))['total'] or 0
                total_revenue = float(
                    order_items.aggregate(total=Sum(F('price') * F('quantity')))['total'] or 0
                )
 
                if total_sales == 0:
                    continue  # skip products with no activity in this period
 
                if product.cost_price is not None:
                    total_cost = float(product.cost_price) * total_sales
                else:
                    total_cost = total_revenue  # unknown cost -> no fabricated profit
                profit = total_revenue - total_cost
 
                # Trend vs. the immediately preceding period of equal length
                previous_items = OrderItem.objects.filter(
                    product=product,
                    order__created_at__gte=previous_start,
                    order__created_at__lt=start_date,
                    order__status='delivered'
                )
                previous_sales = previous_items.aggregate(total=Sum('quantity'))['total'] or 0
                trend = 0
                if previous_sales > 0:
                    trend = ((total_sales - previous_sales) / previous_sales) * 100
                elif total_sales > 0:
                    trend = 100  # new activity where there was none before
 
                image_url = None
                if product.image:
                    image_url = product.image.url
                elif product.image_url:
                    image_url = product.image_url
 
                result.append({
                    'id': product.id,
                    'name': product.name,
                    'category': product.get_category_display(),
                    'image_url': image_url,
                    'sales': total_sales,
                    'revenue': total_revenue,
                    'profit': profit,
                    'trend': float(trend)
                })
 
            result.sort(key=lambda x: x['revenue'], reverse=True)
            return Response(result[:20])
 
        except Exception as e:
            logger.error(f"ProductsView error: {str(e)}")
            return Response({"error": str(e)}, status=500)
 