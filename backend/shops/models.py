from django.db import models
from users.models import User
import uuid

class Shop(models.Model):
    """Shop model for sellers"""
    shop_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    seller = models.OneToOneField(User, on_delete=models.CASCADE, related_name='shop',
                                 limit_choices_to={'role': 'seller'})
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='shop_logos/', null=True, blank=True)
    banner = models.ImageField(upload_to='shop_banners/', null=True, blank=True)
    
    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    
    # Contact
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    
    # Shop details
    rating = models.FloatField(default=0)
    reviews_count = models.IntegerField(default=0)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    verification_status = models.CharField(
        max_length=20,
        choices=[('unverified', 'Unverified'), ('verified', 'Verified'), ('rejected', 'Rejected')],
        default='unverified'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['verification_status']),
        ]

    def __str__(self):
        return self.name


class ShopReview(models.Model):
    """Reviews for shops"""
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='shop_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['shop', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.shop.name} - {self.rating}⭐"


class ShopService(models.Model):
    """Services offered by shops"""
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    icon = models.ImageField(upload_to='services/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['shop', 'name']

    def __str__(self):
        return f"{self.shop.name} - {self.name}"
