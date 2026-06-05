from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

class KeepAdminSessionMiddleware(MiddlewareMixin):
    """
    Middleware to keep admin session alive and prevent frequent logouts
    """
    def process_request(self, request):
        # Check if user is accessing admin panel
        if request.path.startswith('/admin'):
            # If user is authenticated, refresh session
            if request.user.is_authenticated:
                # Set session expiry to 2 weeks from now
                request.session.set_expiry(1209600)  # 2 weeks
                
                # Log session activity (optional)
                logger.debug(f"Admin session refreshed for user: {request.user.username}")