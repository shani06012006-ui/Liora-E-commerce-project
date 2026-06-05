# Run this in Django shell to update order status
from orders.models import Order

# Update order status
order = Order.objects.get(order_number='YOUR_ORDER_NUMBER')
order.status = 'confirmed'  # or 'shipped', 'delivered'
order.save()
print(f"Order {order.order_number} status updated to {order.status}")