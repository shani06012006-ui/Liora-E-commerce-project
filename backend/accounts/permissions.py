# backend/accounts/permissions.py
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied


class IsNotBlocked(BasePermission):
    """
    Custom permission to check if user is not blocked.
    """
    message = "Your account has been blocked by the administrator. Please contact support."
    
    def has_permission(self, request, view):
        user = request.user
        
        if user and user.is_authenticated:
            if hasattr(user, 'is_blocked') and user.is_blocked:
                raise PermissionDenied(detail=self.message)
            return True
        
        return True