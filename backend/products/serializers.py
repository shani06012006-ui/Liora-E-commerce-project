from rest_framework import serializers
from .models import Product, Category
 
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active']
 
 
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )
 
    class Meta:
        model = Product
        fields = '__all__'
 
    def get_category_name(self, obj):
        if obj.category:
            return str(obj.category)
        return None