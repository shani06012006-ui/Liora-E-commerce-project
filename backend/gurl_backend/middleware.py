from django.utils.deprecation import MiddlewareMixin
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
                request.session.set_expiry(1209600)
                
                logger.debug(f"Admin session refreshed for user: {request.user.username}")