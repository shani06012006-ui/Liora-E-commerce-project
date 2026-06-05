from django.contrib import admin
from .models import ShippingCharge

@admin.register(ShippingCharge)
class ShippingChargeAdmin(admin.ModelAdmin):
    list_display = ('min_amount', 'max_amount', 'charge', 'is_active')
    list_filter = ('is_active',)