# models.py for admin_payments
from django.db import models

class PaymentMethod(models.Model):
    METHOD_TYPES = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('razorpay', 'Razorpay'),
        ('cod', 'Cash on Delivery'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
    )
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=METHOD_TYPES)
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name