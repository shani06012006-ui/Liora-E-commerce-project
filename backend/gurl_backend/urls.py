# backend/gurl_backend/urls.py
from django.conf import settings    # noqa
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.views import (
    AdminUserDetailView,
    AdminUserListView,
    GoogleLoginView,
    LoginView,
    RegisterView,
    ResendOTPView,
    UserProfileView,
    VerifyOTPView,
)
from admin_analytics.views import (
    AdminAnalyticsCustomersView,
    AdminAnalyticsProductsView,
    AdminAnalyticsRevenueView,
    AdminAnalyticsSalesView,
)
from admin_payments.views import (
    AdminPaymentMethodsView,
    AdminPaymentMethodToggleView,
    AdminRefundsView,
    AdminTransactionsView,
)
from orders.views import (
    AdminOrderDetailView,
    AdminOrderListView,
    BuyNowView,
    CartView,
    CheckoutView,
    OrderHistoryView,
)
from products.views import (
    AdminCategoryDetailView,
    AdminCategoryListView,
    AdminDashboardStatsView,
    AdminProductDetailView,
    AdminProductListView,
    ProductViewSet,
    PublicCategoryListView,
)
from reviews.views import AdminReviewDetailView, AdminReviewListView, ReviewListView
from shipping.views import ShippingViewSet
from wishlist.views import WishlistViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('shipping', ShippingViewSet, basename='shipping')

urlpatterns = [
    # Auth
    path('api/', include('accounts.urls')),
    path('api/Login/', LoginView.as_view(), name='Login'),

    # Cart & Orders
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/cart/<int:item_id>/', CartView.as_view(), name='cart-item'),
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/orders/', OrderHistoryView.as_view(), name='orders'),
    path('api/buy-now/', BuyNowView.as_view(), name='buy-now'),
    path('api/categories/', PublicCategoryListView.as_view(), name='public-categories'),

    # Admin APIs - Core
    path('api/admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('api/admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('api/admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('api/admin/orders/<int:order_id>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('api/admin/products/', AdminProductListView.as_view(), name='admin-products'),
    path('api/admin/products/<int:product_id>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('api/admin/categories/', AdminCategoryListView.as_view(), name='admin-categories'),
    path('api/admin/categories/<int:category_id>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('api/admin/reviews/', AdminReviewListView.as_view(), name='admin-reviews'),
    path('api/admin/reviews/<int:review_id>/', AdminReviewDetailView.as_view(), name='admin-review-detail'),

    # Admin Analytics URLs
    path('api/admin/analytics/sales/', AdminAnalyticsSalesView.as_view(), name='admin-analytics-sales'),
    path('api/admin/analytics/revenue/', AdminAnalyticsRevenueView.as_view(), name='admin-analytics-revenue'),
    path('api/admin/analytics/customers/', AdminAnalyticsCustomersView.as_view(), name='admin-analytics-customers'),
    path('api/admin/analytics/products/', AdminAnalyticsProductsView.as_view(), name='admin-analytics-products'),

    # Admin Payments URLs
    path('api/admin/payments/methods/', AdminPaymentMethodsView.as_view(), name='admin-payment-methods'),
    path('api/admin/payments/methods/<int:method_id>/', AdminPaymentMethodsView.as_view(), name='admin-payment-method-detail'),
    path('api/admin/payments/methods/<int:method_id>/toggle/', AdminPaymentMethodToggleView.as_view(), name='admin-payment-method-toggle'),
    path('api/admin/payments/transactions/', AdminTransactionsView.as_view(), name='admin-transactions'),
    path('api/admin/payments/refunds/', AdminRefundsView.as_view(), name='admin-refunds'),

    # Token & Reviews
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/reviews/<int:product_id>/', ReviewListView.as_view(), name='reviews'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)