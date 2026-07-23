
# backend/gurl_backend/urls.py
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from accounts.views import ( RegisterView, LoginView, UserProfileView, VerifyOTPView, 
                            ResendOTPView, GoogleLoginView, AdminUserListView, 
                            AdminUserDetailView )
from products.views import ( ProductViewSet, AdminProductListView, AdminProductDetailView, 
                             AdminCategoryListView, AdminCategoryDetailView, 
                             PublicCategoryListView,
                             AdminDashboardStatsView )
from orders.views import CartView, CheckoutView, OrderHistoryView, AdminOrderListView, AdminOrderDetailView, BuyNowView
from wishlist.views import WishlistViewSet
from reviews.views import ReviewListView, AdminReviewListView, AdminReviewDetailView
from shipping.views import ShippingViewSet
 
# Import analytics views
from admin_analytics.views import (
    AdminAnalyticsSalesView,
    AdminAnalyticsRevenueView,
    AdminAnalyticsCustomersView,
    AdminAnalyticsProductsView
)
 
# Import payments views
from admin_payments.views import (
    AdminPaymentMethodsView,
    AdminPaymentMethodToggleView,
    AdminTransactionsView,
    AdminRefundsView
)
 
router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('shipping', ShippingViewSet, basename='shipping')
 
urlpatterns = [
    # Auth
    path('api/', include('accounts.urls')),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('api/auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('api/Login/', LoginView.as_view(), name='Login'),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
 
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