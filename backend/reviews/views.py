
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from orders.models import OrderItem
from .models import Review
from .serializers import ReviewSerializer
from django.db import models
 
 
class ReviewListView(APIView):
    permission_classes = [AllowAny]
 
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
 
    def get(self, request, product_id):
        reviews = Review.objects.filter(
            product_id=product_id, is_hidden=False
        ).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
 
        avg_rating = reviews.aggregate(avg=models.Avg('rating'))['avg'] or 0
 
        return Response({
            'reviews': serializer.data,
            'average_rating': round(avg_rating, 1),
        })
 
    def post(self, request, product_id):
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            order__status='delivered',
            product_id=product_id
        ).exists()
 
        if not has_purchased:
            return Response(
                {"error": "You can only review products you've purchased and received."},
                status=403
            )
 
        serializer = ReviewSerializer(data={**request.data, 'product': product_id})
        if serializer.is_valid():
            serializer.save(user=request.user, is_verified_purchase=True)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
 
 
class AdminReviewListView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        # Check both role and is_staff
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=403)
        
        reviews = Review.objects.all().order_by('-created_at')
        
        # Filter by rating
        rating = request.query_params.get('rating')
        if rating:
            reviews = reviews.filter(rating=rating)
        
        # Filter by verified purchase
        is_verified = request.query_params.get('is_verified_purchase')
        if is_verified is not None:
            reviews = reviews.filter(is_verified_purchase=is_verified.lower() == 'true')
        
        # Filter by hidden
        is_hidden = request.query_params.get('is_hidden')
        if is_hidden is not None:
            reviews = reviews.filter(is_hidden=is_hidden.lower() == 'true')
        
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
 
    def post(self, request):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=403)
 
        from django.contrib.auth import get_user_model
        User = get_user_model()
 
        user_id = request.data.get('user')
        product_id = request.data.get('product')
 
        if not user_id or not product_id:
            return Response({"error": "Both 'user' and 'product' are required."}, status=400)
 
        try:
            review_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
 
        if Review.objects.filter(user_id=user_id, product_id=product_id).exists():
            return Response({"error": "This customer already has a review for this product."}, status=400)
 
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                user=review_user,
                is_verified_purchase=request.data.get('is_verified_purchase', False),
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
 
 
class AdminReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request, review_id):
        # Check both role and is_staff
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=403)
        
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=404)
        
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
 
    def patch(self, request, review_id):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=403)
        
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=404)
        
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
 
    def delete(self, request, review_id):
        if not request.user.is_staff and getattr(request.user, 'role', '') != 'admin':
            return Response({"error": "Access denied."}, status=403)
        
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=404)
        
        review.delete()
        return Response({"message": "Review deleted."}, status=204)