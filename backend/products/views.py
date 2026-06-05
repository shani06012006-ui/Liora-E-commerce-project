from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]
    
    def list(self, request):
        queryset = Product.objects.all()
        
        # Filter by new arrivals
        new_arrivals = request.query_params.get('new_arrivals', None)
        if new_arrivals and new_arrivals.lower() == 'true':
            queryset = queryset.filter(is_new_arrival=True)
        
        # Filter by best sellers
        best_sellers = request.query_params.get('best_sellers', None)
        if best_sellers and best_sellers.lower() == 'true':
            queryset = queryset.filter(is_best_seller=True)
        
        # Filter by sale
        sale = request.query_params.get('sale', None)
        if sale and sale.lower() == 'true':
            queryset = queryset.filter(is_on_sale=True)
        
        # Search
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Filter by category
        category = request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by style
        style = request.query_params.get('style', None)
        if style:
            queryset = queryset.filter(style=style)
        
        # Sort
        sort = request.query_params.get('sort', None)
        if sort == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')
        
        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        product = self.get_object()
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)