# backend/admin_payments/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from orders.models import Order


class AdminPaymentMethodsView(APIView):
    """Manage payment methods"""
    permission_classes = [IsAuthenticated]

    payment_methods = [
        {'id': 1, 'name': 'Credit Card', 'type': 'credit_card', 'is_active': True, 'config': {}},
        {'id': 2, 'name': 'Debit Card', 'type': 'debit_card', 'is_active': True, 'config': {}},
        {'id': 3, 'name': 'PayPal', 'type': 'paypal', 'is_active': True, 'config': {}},
        {'id': 4, 'name': 'Stripe', 'type': 'stripe', 'is_active': True, 'config': {}},
        {'id': 5, 'name': 'Cash on Delivery', 'type': 'cod', 'is_active': True, 'config': {}},
    ]

    def get(self, request):
        try:
            return Response(self.payment_methods)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            data = request.data
            new_method = {
                'id': len(self.payment_methods) + 1,
                'name': data.get('name'),
                'type': data.get('type'),
                'is_active': data.get('is_active', True),
                'config': data.get('config', {})
            }
            self.payment_methods.append(new_method)
            return Response(new_method, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def patch(self, request, method_id):
        try:
            for method in self.payment_methods:
                if method['id'] == method_id:
                    data = request.data
                    if 'name' in data:
                        method['name'] = data['name']
                    if 'type' in data:
                        method['type'] = data['type']
                    if 'is_active' in data:
                        method['is_active'] = data['is_active']
                    if 'config' in data:
                        method['config'].update(data['config'])
                    return Response(method)
            return Response({"error": "Method not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, method_id):
        try:
            for i, method in enumerate(self.payment_methods):
                if method['id'] == method_id:
                    self.payment_methods.pop(i)
                    return Response({"message": "Deleted successfully"})
            return Response({"error": "Method not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AdminPaymentMethodToggleView(APIView):
    """Toggle payment method active status"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, method_id):
        try:
            from .views import AdminPaymentMethodsView
            for method in AdminPaymentMethodsView.payment_methods:
                if method['id'] == method_id:
                    method['is_active'] = request.data.get('is_active', not method['is_active'])
                    return Response(method)
            return Response({"error": "Method not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AdminTransactionsView(APIView):
    """View all payment transactions"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)

            # Get all orders with payment info
            orders = Order.objects.all().order_by('-created_at')
            
            # Apply filters
            search = request.query_params.get('search', '')
            status_filter = request.query_params.get('status', '')

            if search:
                orders = orders.filter(
                    Q(order_number__icontains=search) |
                    Q(user__username__icontains=search) |
                    Q(user__email__icontains=search)
                )

            if status_filter:
                orders = orders.filter(payment_status=status_filter)

            # Build transaction list
            result = []
            for order in orders:
                result.append({
                    'id': f"txn_{order.id}",
                    'transaction_id': f"TXN{order.id:06d}",
                    'order_number': order.order_number,
                    'customer_name': order.user.full_name or order.user.username,
                    'customer_email': order.user.email,
                    'amount': float(order.total_amount),
                    'payment_method': getattr(order, 'payment_method', 'N/A'),
                    'status': getattr(order, 'payment_status', 'pending'),
                    'created_at': order.created_at.isoformat()
                })

            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AdminRefundsView(APIView):
    """View and manage refunds"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff:
                return Response({"error": "Admin access required"}, status=403)

            # Get orders with refund status
            orders = Order.objects.filter(payment_status='refunded').order_by('-created_at')
            
            status_filter = request.query_params.get('status', '')
            if status_filter:
                orders = orders.filter(payment_status=status_filter)

            result = []
            for order in orders:
                result.append({
                    'id': f"ref_{order.id}",
                    'refund_id': f"REF{order.id:06d}",
                    'order_number': order.order_number,
                    'customer_name': order.user.full_name or order.user.username,
                    'amount': float(order.total_amount),
                    'reason': 'Customer requested refund',
                    'status': getattr(order, 'payment_status', 'pending'),
                    'created_at': order.created_at.isoformat()
                })

            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)