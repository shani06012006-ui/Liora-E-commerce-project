from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.permissions import  IsAdminUser, AllowAny
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
        
        new_arrivals = request.query_params.get('new_arrivals', None)
        if new_arrivals and new_arrivals.lower() == 'true':
            queryset = queryset.filter(is_new_arrival=True)
        
        best_sellers = request.query_params.get('best_sellers', None)
        if best_sellers and best_sellers.lower() == 'true':
            queryset = queryset.filter(is_best_seller=True)
        
        sale = request.query_params.get('sale', None)
        if sale and sale.lower() == 'true':
            queryset = queryset.filter(is_on_sale=True)
        
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        category = request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        style = request.query_params.get('style', None)
        if style:
            queryset = queryset.filter(style=style)
        
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
    
    
class AdminProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        products = Product.objects.all().order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class AdminProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        return Response(ProductSerializer(product).data)

    def patch(self, request, product_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, product_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        product.delete()
        return Response({"message": "Product deleted."}, status=204)        