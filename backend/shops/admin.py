from django.contrib import admin
from .models import Shop, ShopReview, ShopService


class ShopServiceInline(admin.TabularInline):
    """
    Inline admin descriptor for ShopService models.
    Allows managing services directly from the Shop editing page.
    """
    model = ShopService
    extra = 1
    fields = ['name', 'price', 'description']


class ShopReviewInline(admin.TabularInline):
    """
    Inline admin descriptor for ShopReview models.
    """
    model = ShopReview
    extra = 0
    readonly_fields = ['user', 'rating', 'comment', 'created_at']
    can_delete = True


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Shop model.
    Architectural Note: The Shop model is the core tenant for the multi-seller platform. 
    It links directly to a User (role='seller') and acts as the parent for Products, Services, and Orders.
    """
    list_display = ['name', 'seller', 'city', 'rating', 'verification_status', 'is_active', 'is_open']
    list_filter = ['verification_status', 'is_active', 'is_open', 'online_delivery_enabled', 'city']
    search_fields = ['name', 'seller__username', 'seller__email', 'phone', 'city']
    list_editable = ['verification_status', 'is_active', 'is_open']
    inlines = [ShopServiceInline, ShopReviewInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'seller', 'description', 'shop_code')
        }),
        ('Classification & Media', {
            'fields': ('category', 'subcategory', 'logo', 'banner')
        }),
        ('Location Details', {
            'fields': ('address', 'city', 'state', 'pincode', 'latitude', 'longitude')
        }),
        ('Contact & Operation', {
            'fields': ('phone', 'email', 'opening_time', 'closing_time')
        }),
        ('Status & Metrics (Read Only metrics)', {
            'fields': ('verification_status', 'is_active', 'is_open', 'online_delivery_enabled', 'rating', 'reviews_count')
        }),
    )
    readonly_fields = ['shop_code', 'rating', 'reviews_count']


@admin.register(ShopReview)
class ShopReviewAdmin(admin.ModelAdmin):
    """
    Admin configuration for Shop Reviews.
    """
    list_display = ['shop', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['shop__name', 'user__username', 'comment']
    readonly_fields = ['created_at']


@admin.register(ShopService)
class ShopServiceAdmin(admin.ModelAdmin):
    """
    Admin configuration for Shop Services.
    """
    list_display = ['name', 'shop', 'price', 'created_at']
    list_filter = ['shop', 'created_at']
    search_fields = ['name', 'shop__name']
