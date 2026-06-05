from django.db import models

class ShippingCharge(models.Model):
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    charge = models.DecimalField(max_digits=10, decimal_places=2, default=99)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        if self.max_amount:
            return f"₹{self.min_amount} - ₹{self.max_amount}: ₹{self.charge}"
        return f"Above ₹{self.min_amount}: Free"