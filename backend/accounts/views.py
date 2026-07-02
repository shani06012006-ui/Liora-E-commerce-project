from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .serializers import RegisterSerializer, OTPVerifySerializer, UserSerializer
from .models import OTPVerification
from .tasks import send_otp_email


User = get_user_model()


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp_code = OTPVerification.generate_otp()
            OTPVerification.objects.create(user=user, otp_code=otp_code)
            send_otp_email.delay(user.email, otp_code, user.username)
            return Response(
                {"message": "Registered successfully. OTP sent to your email."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
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

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
        }, status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    def post(self, request):
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

        email    = google_data.get("email")
        name     = google_data.get("name", "")

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

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
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
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email    = serializer.validated_data["email"]
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
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

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
        return Response({
            "message": "Account verified successfully.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
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

        return Response(
            {"message": "OTP resent successfully."},
            status=status.HTTP_200_OK,
        )
        
class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({"message": "User deleted."}, status=status.HTTP_204_NO_CONTENT)            