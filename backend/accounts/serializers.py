from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'address', 'role',
            'is_blocked', 'full_name', 'profile_pic', 'profile_pic_url',
            'bio', 'location', 'created_at'
        ]
        read_only_fields = ['role', 'is_blocked', 'username', 'created_at']

    def get_profile_pic_url(self, obj):
        if obj.profile_pic:
            return f"http://localhost:5174/media/{obj.profile_pic}"
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Password must be at least 6 characters.',
            'blank': 'Password cannot be empty.',
        }
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False,
        )
        return user


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)