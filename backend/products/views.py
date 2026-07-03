from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


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


class AdminCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, category_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=404)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, category_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=404)
        category.delete()
        return Response({"message": "Category deleted."}, status=204)