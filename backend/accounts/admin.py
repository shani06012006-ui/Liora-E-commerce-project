# backend/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTPVerification, Address

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'full_name', 'role', 'is_active', 'is_blocked', 'is_deleted')
    list_filter = ('role', 'is_active', 'is_blocked', 'is_deleted')
    search_fields = ('username', 'email', 'full_name', 'phone')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone', 'address', 'is_blocked', 'is_deleted', 
                      'full_name', 'bio', 'location', 'profile_pic'),
        }),
    )

admin.site.register(OTPVerification)
admin.site.register(Address)