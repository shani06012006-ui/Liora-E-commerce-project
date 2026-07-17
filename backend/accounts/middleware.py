# backend/accounts/middleware.py
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


class BlockedUserMiddleware:
    """
    Middleware to check if the authenticated user is blocked.
    Blocks access to all authenticated endpoints except public ones.
    """
    
    PUBLIC_PATHS = [
        '/api/Login/',
        '/api/register/',
        '/api/verify-otp/',
        '/api/resend-otp/',
        '/api/auth/google/',
        '/api/token/refresh/',
        '/api/products/',
        '/api/reviews/',
    ]
    
    BLOCKED_GET_PATHS = [
        '/api/cart/',
        '/api/wishlist/',
        '/api/orders/',
        '/api/profile/',
        '/api/addresses/',
        '/api/checkout/',
        '/api/buy-now/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        for public_path in self.PUBLIC_PATHS:
            if request.path.startswith(public_path):
                return self.get_response(request)

        user = getattr(request, 'user', None)
        
        if user and user.is_authenticated:
            if hasattr(user, 'is_blocked') and user.is_blocked:
                if request.method == 'GET':
                    for blocked_path in self.BLOCKED_GET_PATHS:
                        if request.path.startswith(blocked_path):
                            return JsonResponse({
                                "error": "Your account has been blocked by the administrator. Please contact support.",
                                "blocked": True
                            }, status=status.HTTP_403_FORBIDDEN)
                    return self.get_response(request)
                
                return JsonResponse({
                    "error": "Your account has been blocked by the administrator. Please contact support.",
                    "blocked": True
                }, status=status.HTTP_403_FORBIDDEN)

        return self.get_response(request)