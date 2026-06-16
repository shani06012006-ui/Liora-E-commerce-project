from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Categories'

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('collections', 'Collections'),
        ('casual', 'Casual Wear'),
        ('party', 'Party Wear'),
        ('office', 'Office Wear'),
        ('aesthetic', 'Aesthetic'),
    ]
    
    STYLE_CHOICES = [
        ('party', 'Party'),
        ('casual', 'Casual'),
        ('office', 'Office'),
        ('aesthetic', 'Aesthetic'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.IntegerField(default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='collections')
    style = models.CharField(max_length=50, choices=STYLE_CHOICES, null=True, blank=True)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    is_new_arrival = models.BooleanField(default=False, help_text="Check this to show product in New Arrivals section")
    is_best_seller = models.BooleanField(default=False, help_text="Check this to show product in Best Sellers section")
    is_on_sale = models.BooleanField(default=False, help_text="Check this to show product in Sale section")
    created_at = models.DateTimeField(auto_now_add=True)



    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        if self.discount > 0:
            return float(self.price) - (float(self.price) * self.discount / 100)
        return float(self.price)