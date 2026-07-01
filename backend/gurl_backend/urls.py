from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from accounts.views import RegisterView, LoginView, UserProfileView, VerifyOTPView, ResendOTPView
from products.views import ProductViewSet
from orders.views import CartView, CheckoutView, OrderHistoryView
from wishlist.views import WishlistViewSet
from reviews.views import ReviewListView

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('api/Login/', LoginView.as_view(), name='Login'),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/cart/<int:item_id>/', CartView.as_view(), name='cart-item'),
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/orders/', OrderHistoryView.as_view(), name='orders'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/reviews/<int:product_id>/', ReviewListView.as_view(), name='reviews'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/Login/', LoginView.as_view(), name='Login'),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
    path('api/cart/', CartView.as_view(), name='cart'), 
    path('api/cart/<int:item_id>/', CartView.as_view(), name='cart-item'),  
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/orders/', OrderHistoryView.as_view(), name='orders'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/' , TokenObtainPairView.as_view()),
    path('api/reviews/<int:product_id>/', ReviewListView.as_view(), name='reviews'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
