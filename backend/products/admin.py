from django.contrib import admin
from .models import Category, SubCategory, Product, ProductReview


class ProductReviewInline(admin.TabularInline):
    """
    Inline admin descriptor for ProductReview models.
    """
    model = ProductReview
    extra = 0
    readonly_fields = ['user', 'rating', 'comment', 'created_at']
    can_delete = True


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for Categories.
    Architectural Note: Categories are the top-level classification for Products.
    """
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for SubCategories.
    """
    list_display = ['name', 'category']
    list_filter = ['category']
    search_fields = ['name', 'category__name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Product model.
    Architectural Note: Products belong to a Shop (via seller). 
    Variants are stored in a JSONField for dynamic flexibility (e.g. Size, Color).
    """
    list_display = ['name', 'seller', 'category', 'price', 'stock', 'rating', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'seller__username', 'description']
    list_editable = ['price', 'stock', 'is_active']
    inlines = [ProductReviewInline]
    
    fieldsets = (
        ('Product Details', {
            'fields': ('name', 'description', 'seller', 'category', 'subcategory')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'discount_price', 'stock')
        }),
        ('Variants & Metadata', {
            'fields': ('variants', 'image', 'is_active')
        }),
        ('Metrics (Read Only)', {
            'fields': ('rating', 'reviews_count', 'created_at', 'updated_at')
        }),
    )
    readonly_fields = ['rating', 'reviews_count', 'created_at', 'updated_at']


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    """
    Admin configuration for Product Reviews.
    """
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__username', 'comment']
    readonly_fields = ['created_at']
