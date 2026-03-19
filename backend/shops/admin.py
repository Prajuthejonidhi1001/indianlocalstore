from django.contrib import admin
from .models import Shop, ShopReview, ShopService


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ['name', 'seller', 'city', 'rating', 'verification_status', 'is_active']
    list_filter = ['city', 'verification_status', 'is_active']
    search_fields = ['name', 'seller__username']


@admin.register(ShopReview)
class ShopReviewAdmin(admin.ModelAdmin):
    list_display = ['shop', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']


@admin.register(ShopService)
class ShopServiceAdmin(admin.ModelAdmin):
    list_display = ['shop', 'name', 'price']
    list_filter = ['shop']
