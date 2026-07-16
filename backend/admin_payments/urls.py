# admin_payments/urls.py
from django.urls import path
from .views import (
    AdminPaymentMethodsView,
    AdminPaymentMethodToggleView,
    AdminTransactionsView,
    AdminRefundsView
)

urlpatterns = [
    path('methods/', AdminPaymentMethodsView.as_view(), name='admin-payment-methods'),
    path('methods/<int:method_id>/', AdminPaymentMethodsView.as_view(), name='admin-payment-method-detail'),
    path('methods/<int:method_id>/toggle/', AdminPaymentMethodToggleView.as_view(), name='admin-payment-method-toggle'),
    path('transactions/', AdminTransactionsView.as_view(), name='admin-transactions'),
    path('refunds/', AdminRefundsView.as_view(), name='admin-refunds'),
]