from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from wishlist.models import Wishlist
from products.models import Product
from .serializers import WishlistSerializer

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)
    
    def create(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )
        
        if created:
            return Response({ 
                'id':wishlist_item.id, 
                'message': 'Added to wishlist'}, 
                status=status.HTTP_201_CREATED)
        return Response({'message': 'Already in wishlist'}, status=status.HTTP_200_OK)
    
    def destroy(self, request, pk=None):
        wishlist_item = get_object_or_404(Wishlist, id=pk, user=request.user)
        wishlist_item.delete()                                                                             #DB row removed
        return Response({'message': 'Removed from wishlist'}, status=status.HTTP_200_OK)