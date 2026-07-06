from rest_framework.permissions import BasePermission

class IsNotBlocked(BasePermission):
    message = "Your account has been blocked by the administrator."

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return not request.user.is_blocked
        return True