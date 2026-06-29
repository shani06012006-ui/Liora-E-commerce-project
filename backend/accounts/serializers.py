from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_pic_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'address', 'role', 
                 'is_blocked', 'full_name', 'profile_pic', 'profile_pic_url', 
                 'bio', 'location', 'created_at']
        read_only_fields = ['role', 'is_blocked', 'username', 'created_at']
    
    def get_profile_pic_url(self, obj):
        if obj.profile_pic:
            return f"http://localhost:8000/media/{obj.profile_pic}"
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone', 'address', 'full_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            full_name=validated_data.get('full_name', '')
        )
        return user


