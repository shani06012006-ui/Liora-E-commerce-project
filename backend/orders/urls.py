from django.urls import path
from .views import (
    CartView,
    CheckoutView,
    OrderHistoryView,
    BuyNowView,
    AdminOrderListView,
    AdminOrderDetailView,
)

urlpatterns = [
    path("cart/", CartView.as_view()),
    path("cart/<int:item_id>/", CartView.as_view()),

    path("checkout/", CheckoutView.as_view()),
    path("buy-now/", BuyNowView.as_view()),
    path("history/", OrderHistoryView.as_view()),

    path("admin/orders/", AdminOrderListView.as_view()),
    path("admin/orders/<int:order_id>/", AdminOrderDetailView.as_view()),
]