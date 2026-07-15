from django.db import models
 
 
def default_general():
    return {
        "storeName": "LIORA",
        "supportEmail": "support@liora.com",
        "storeAddress": "123, Fashion Street, Coimbatore,\nTamil Nadu, India - 641001",
        "phoneNumber": "+91 98765 43210",
        "aboutStore": "LIORA is a premium girls fashion brand offering timeless style, "
                       "elegance and quality in every piece.",
        "logoUrl": None,
        "socialLinks": {"instagram": "", "facebook": "", "pinterest": "", "tiktok": "", "youtube": ""},
    }
 
 
def default_store():
    return {
        "currency": "INR",
        "language": "English",
        "timezone": "Asia/Kolkata",
        "productsPerPage": 20,
        "maintenanceMode": False,
    }
 
 
def default_shipping():
    return {
        "freeShipping": 999,
        "shippingCharge": 79,
        "estimatedDelivery": "3 - 5 Days",
        "codEnabled": True,
        "deliveryAreas": ["Tamil Nadu", "Kerala", "Karnataka"],
    }
 
 
def default_payments():
    return {
        "razorpayEnabled": True,
        "stripeEnabled": True,
        "codEnabled": True,
        "refundDays": 7,
    }
 
 
def default_tax():
    return {"gstRate": 18, "applyTax": True, "invoicePrefix": "LIORA-"}
 
 
def default_notifications():
    return {
        "newOrder": True,
        "orderCancelled": True,
        "lowStockAlert": True,
        "newUserRegistered": True,
        "newReview": True,
        "newCouponUsed": True,
    }
 
 
def default_homepage():
    return {
        "heroBanner": True,
        "featuredCollections": True,
        "featuredCategories": True,
        "featuredProducts": True,
    }
 
 
class StoreSettings(models.Model):
    """Singleton row (pk is always 1) holding every settings section as JSON."""
 
    general = models.JSONField(default=default_general)
    store = models.JSONField(default=default_store)
    shipping = models.JSONField(default=default_shipping)
    payments = models.JSONField(default=default_payments)
    tax = models.JSONField(default=default_tax)
    notifications = models.JSONField(default=default_notifications)
    homepage = models.JSONField(default=default_homepage)
    updated_at = models.DateTimeField(auto_now=True)
 
    SECTIONS = ["general", "store", "shipping", "payments", "tax", "notifications", "homepage"]
 
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
 
    def delete(self, *args, **kwargs):
        pass  # singleton — never actually deleted
 
    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
 
    def __str__(self):
        return "Store Settings"