from django.contrib.auth import get_user_model
from django.db import models
from products.models import Product

User = get_user_model()


class Wishlist(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="wishlist_items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="wishlisted_by"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "product"]     #can't add the same product twice
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
