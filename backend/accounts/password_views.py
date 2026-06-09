from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Generate reset token
            reset_token = get_random_string(50)
            user.reset_token = reset_token
            user.reset_token_expires = timezone.now() + timedelta(hours=24)
            user.save()
            
            return Response({
                'message': 'Password reset link sent to your email',
                'reset_token': reset_token  
            })
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email'}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        try:
            user = User.objects.get(reset_token=token, reset_token_expires__gt=timezone.now())
            user.set_password(new_password)
            user.reset_token = None
            user.reset_token_expires = None
            user.save()
            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)