from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import pre_save
from django.dispatch import receiver
from products.models import Product
 
User = get_user_model()
 
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        unique_together = ['user', 'product']
 
    def total_price(self):
        return self.product.price * self.quantity
 
    def __str__(self):
        return f"{self.user.username} - {self.product.name} x{self.quantity}"
 
 
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
 
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=50, default='cod', blank=True)
 
    shipping_address = models.TextField()
    phone = models.CharField(max_length=15)
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    def save(self, *args, **kwargs):
        if self.pk:
            old_status = Order.objects.get(pk=self.pk).status
            self._validate_status_transition(old_status, self.status)
        super().save(*args, **kwargs)
 
    def _validate_status_transition(self, old_status, new_status):
        from django.core.exceptions import ValidationError
 
        FORWARD_FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
 
        if old_status == new_status:
            return
 
        if old_status == 'delivered':
            raise ValidationError("Delivered orders cannot change status.")
 
        if old_status == 'cancelled':
            raise ValidationError("Cancelled orders cannot change status.")
 
        if new_status == 'cancelled':
            return
 
        if old_status in FORWARD_FLOW and new_status in FORWARD_FLOW:
            if FORWARD_FLOW.index(new_status) < FORWARD_FLOW.index(old_status):
                raise ValidationError(f"Cannot move order from '{old_status}' back to '{new_status}'.")
 
    def __str__(self):
        return f"Order {self.order_number}"
 
 
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
 
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
 
    def total_price(self):
        return self.price * self.quantity
 
 
@receiver(pre_save, sender=Order)
def restore_stock_on_cancel(sender, instance, **kwargs):
    if not instance.pk:
        return
 
    old_order = Order.objects.filter(pk=instance.pk).first()
    if old_order and old_order.status != 'cancelled' and instance.status == 'cancelled':
        for item in instance.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()