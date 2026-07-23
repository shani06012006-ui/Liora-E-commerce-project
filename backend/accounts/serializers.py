# backend/accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'phone',
            'address',
            'role',
            'is_staff',
            'is_active',
            'is_blocked',
            'is_deleted',
            'created_at',
            'bio',
            'location',
            'profile_pic',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'created_at', 'date_joined', 'last_login']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'full_name',
            'phone',
        ]

    def validate_email(self, value):
        user = User.objects.filter(email=value).first()

        if user and not user.is_deleted and user.is_active:
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def create(self, validated_data):

        # Generate username from email
        username = validated_data["email"].split("@")[0]

        # Make username unique
        original = username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{original}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data.get("full_name", ""),
            phone=validated_data.get("phone", ""),
            is_active=False,
        )

        return user


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'full_name',
            'phone',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'pincode',
            'landmark',
            'address_type',
            'is_default',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']