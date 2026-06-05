from accounts.models import User
from products.models import Product
from orders.models import Order

def admin_dashboard_stats(request):
    if request.path.startswith('/admin'):
        return {
            'user_count': User.objects.count(),
            'product_count': Product.objects.count(),
            'order_count': Order.objects.count(),
            'total_revenue': sum(order.total_amount for order in Order.objects.filter(status='delivered')),
        }
    return {}