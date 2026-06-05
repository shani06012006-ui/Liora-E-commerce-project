from django.contrib import admin
from .models import Product, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discount', 'stock', 'is_new_arrival', 'is_best_seller', 'is_on_sale', 'created_at')
    list_filter = ('category', 'style', 'is_new_arrival', 'is_best_seller', 'is_on_sale', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('price', 'discount', 'stock', 'is_new_arrival', 'is_best_seller', 'is_on_sale')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'style')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price', 'discount')
        }),
        ('Inventory', {
            'fields': ('stock',)
        }),
        ('Images', {
            'fields': ('image', 'image_url')
        }),
        ('Sections', {
            'fields': ('is_new_arrival', 'is_best_seller', 'is_on_sale'),
            'description': 'Select which sections this product should appear in'
        }),
    )