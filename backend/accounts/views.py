# backend/accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.db import models
from .serializers import RegisterSerializer, OTPVerifySerializer, UserSerializer , AddressSerializer
from .models import Address
from .models import OTPVerification
from .tasks import send_otp_email 

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    id_token = None
    google_requests = None

User = get_user_model()

class AddressListView(APIView):
    """Get all addresses for the current user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddressDetailView(APIView):
    """Create, update, or delete a specific address"""
    permission_classes = [IsAuthenticated]

    def get_object(self, address_id, user):
        try:
            return Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            return None

    def post(self, request):
        """Create a new address"""
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            address = serializer.save(user=request.user)
            
            # If this is the first address for the user, make it default
            if Address.objects.filter(user=request.user).count() == 1:
                address.is_default = True
                address.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, address_id):
        """Update an existing address"""
        address = self.get_object(address_id, request.user)
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, address_id):
        """Delete an address"""
        address = self.get_object(address_id, request.user)
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # If deleting the default address, set another address as default
        if address.is_default:
            next_address = Address.objects.filter(user=request.user).exclude(id=address_id).first()
            if next_address:
                next_address.is_default = True
                next_address.save()
        
        address.delete()
        return Response({"message": "Address deleted successfully."}, status=status.HTTP_200_OK)


class SetDefaultAddressView(APIView):
    """Set a specific address as default"""
    permission_classes = [IsAuthenticated]

    def post(self, request, address_id):
        address = Address.objects.filter(id=address_id, user=request.user).first()
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
        
        address.is_default = True
        address.save()
        
        full_address = f"{address.address_line1}, {address.city}, {address.state} - {address.pincode}"
        user = request.user
        user.address = full_address
        user.phone = address.phone
        user.full_name = address.full_name
        user.save()
        
        return Response({"message": "Default address updated."}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print(f"NEW USER REGISTERED WITH EMAIL: '{user.email}'")
            otp_code = OTPVerification.generate_otp()
            OTPVerification.objects.create(user=user, otp_code=otp_code)
            
            send_otp_email.delay(user.email, otp_code, user.username)
            print(f" OTP task queued for {user.email}")
            
            return Response(
                {"message": "Registered successfully. OTP sent to your email."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]    
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found or already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_code = OTPVerification.generate_otp()
        OTPVerification.objects.create(user=user, otp_code=otp_code)
        
        send_otp_email.delay(user.email, otp_code, user.username)
        print(f"OTP task queued for {user.email}")

        return Response(
            {"message": "OTP resent successfully."},
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user_obj.is_active:
            return Response(
                {"error": "Account not verified. Please verify OTP first."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = authenticate(request, username=user_obj.username, password=password)
        if not user:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if hasattr(user, 'is_blocked') and user.is_blocked:
            return Response(
                {"error": "Your account has been blocked by the administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": getattr(user, 'full_name', user.username),
            "role": getattr(user, 'role', 'user'),
            "is_staff": user.is_staff,
            "is_active": user.is_active,
            "is_blocked": getattr(user, 'is_blocked', False),
            "phone": getattr(user, 'phone', ''),
            "address": getattr(user, 'address', ''),
            "profile_pic_url": getattr(user, 'profile_pic', None) and user.profile_pic.url or '',
        }
        
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data,
        }, status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        if not GOOGLE_AUTH_AVAILABLE:
            return Response(
                {"error": "Google login is not configured. Please install google-auth."},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
            
        credential = request.data.get("credential")
        if not credential:
            return Response(
                {"error": "Google credential required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            google_data = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response(
                {"error": "Invalid Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = google_data.get("email")
        name = google_data.get("name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "full_name": name,
                "is_active": True,
            }
        )

        if not user.is_active:
            user.is_active = True
            user.save()
        
        if hasattr(user, 'is_blocked') and user.is_blocked:
            return Response(
                {"error": "Your account has been blocked by the administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_active": user.is_active,
            "role": getattr(user, 'role', 'user'),
            "is_blocked": getattr(user, 'is_blocked', False),
            "full_name": getattr(user, 'full_name', ''),
            "phone": getattr(user, 'phone', ''),
        }
        
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data,
            "created": created,
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]    
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp_code = serializer.validated_data["otp_code"]

        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found or already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_obj = (
            OTPVerification.objects
            .filter(user=user, otp_code=otp_code)
            .order_by("-created_at")
            .first()
        )

        if not otp_obj:
            return Response(
                {"error": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.is_expired():
            return Response(
                {"error": "OTP expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save()

        otp_obj.is_verified = True
        otp_obj.save()

        refresh = RefreshToken.for_user(user)
        
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_active": user.is_active,
            "role": getattr(user, 'role', 'user'),
            "is_blocked": getattr(user, 'is_blocked', False),
            "full_name": getattr(user, 'full_name', ''),
            "phone": getattr(user, 'phone', ''),
        }

        return Response(
            {
                "message": "Account verified successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )



class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    def get(self, request, user_id):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object(user_id)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        try:
          from orders.models import Order

          orders = Order.objects.filter(user=user, status="delivered")
          total_orders = orders.count()
          total_spent = (
             orders.aggregate(total=models.Sum("total_amount"))["total"] or 0
             )
          last_order = orders.order_by("-created_at").first()

        except Exception:
           total_orders = 0
           total_spent = 0
           last_order = None

        serializer = UserSerializer(user)
        data = serializer.data
        data['orders_count'] = total_orders
        data['total_spent'] = float(total_spent)
        data['last_order_date'] = last_order.created_at.isoformat() if last_order else None
        
        return Response(data)

    def patch(self, request, user_id):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object(user_id)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Handle is_blocked separately
        if 'is_blocked' in request.data:
            user.is_blocked = request.data['is_blocked']
            user.save()
            return Response({
                "message": f"User {'blocked' if user.is_blocked else 'unblocked'}",
                "is_blocked": user.is_blocked
            })

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object(user_id)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if user.id == request.user.id:
            return Response({"error": "Cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)