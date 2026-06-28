from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from .models import Review
from products.models import Product
from .serializers import ReviewSerializer

class ReviewListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        reviews = Review.objects.filter(product=product)
        serializer = ReviewSerializer(reviews, many=True)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        return Response({
            'reviews': serializer.data,
            'average_rating': round(avg_rating, 1),
            'total_reviews': reviews.count()
        })
    
    def post(self, request, product_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        product = get_object_or_404(Product, id=product_id)
        
        if Review.objects.filter(user=request.user, product=product).exists():
            return Response({'error': 'You have already reviewed this product'}, status=status.HTTP_400_BAD_REQUEST)
        
        rating = request.data.get('rating')
        title = request.data.get('title', '')
        comment = request.data.get('comment', '')
        
        if not rating:
            return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from orders.models import OrderItem
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            product_id=product_id,
            order__status='delivered'
        ).exists()
        
        review = Review.objects.create(
            user=request.user,
            product=product,
            rating=int(rating),
            title=title,
            comment=comment,
            is_verified_purchase=has_purchased
        )
        
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
