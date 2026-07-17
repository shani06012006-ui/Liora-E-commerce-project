# backend/accounts/urls.py
from django.urls import path
from .views import (
    RegisterView, LoginView, UserProfileView, VerifyOTPView, 
    ResendOTPView, GoogleLoginView, AdminUserListView, AdminUserDetailView,
    AddressListView, AddressDetailView, SetDefaultAddressView , AdminUserCreateView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth URLs
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),    
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    
    # Address URLs - User-specific
    path("addresses/", AddressListView.as_view(), name="address-list"),
    path("addresses/create/", AddressDetailView.as_view(), name="address-create"),
    path("addresses/<int:address_id>/", AddressDetailView.as_view(), name="address-detail"),
    path("addresses/<int:address_id>/set-default/", SetDefaultAddressView.as_view(), name="address-set-default"),
    
    # Admin User URLs
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/create/", AdminUserCreateView.as_view(), name="admin-user-create"),
    path("admin/users/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),

]