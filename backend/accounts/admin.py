from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone', 'role', 'is_blocked', 'created_at')
    list_filter = ('role', 'is_blocked', 'is_active', 'created_at')
    list_editable = ('is_blocked',)
    search_fields = ('username', 'email', 'phone')
    list_per_page = 20
    
    fieldsets = UserAdmin.fieldsets + (
        ('Personal Information', {
            'fields': ('phone', 'address', 'full_name', 'profile_pic')
        }),
        ('Account Status', {
            'fields': ('role', 'is_blocked'),
            'classes': ('wide',),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Personal Information', {
            'fields': ('phone', 'address', 'full_name')
        }),
        ('Account Type', {
            'fields': ('role',),
        }),
    )

admin.site.register(User, CustomUserAdmin)