from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'product'] 
    
    def total_price(self):
        return self.product.price * self.quantity
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} x{self.quantity}"
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped',   'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS = [
        ('pending',  'Pending'),
        ('paid',     'Paid'),
        ('failed',   'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    user             = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number     = models.CharField(max_length=50, unique=True)
    total_amount     = models.DecimalField(max_digits=10, decimal_places=2)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status   = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method   = models.CharField(max_length=50, blank=True, default='cod')
    shipping_address = models.TextField()
    phone            = models.CharField(max_length=15)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.order_number}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def total_price(self):
        return self.price * self.quantity