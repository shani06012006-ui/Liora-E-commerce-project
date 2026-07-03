from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Review
from .serializers import ReviewSerializer


class ReviewListView(APIView):
    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, product_id):
        serializer = ReviewSerializer(data={
            **request.data,
            'product': product_id,
            'user': request.user.id
        })
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class AdminReviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        reviews = Review.objects.all().order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class AdminReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, review_id):
        if request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=404)
        review.delete()
        return Response({"message": "Review deleted."}, status=204)

    def patch(self, request, review_id):
        if request.user.role != 'admin':
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