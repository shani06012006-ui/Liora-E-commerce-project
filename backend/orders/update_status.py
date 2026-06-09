from orders.models import Order

order = Order.objects.get(order_number='YOUR_ORDER_NUMBER')
order.status = 'confirmed'  # or 'shipped', 'delivered'
order.save()
print(f"Order {order.order_number} status updated to {order.status}")