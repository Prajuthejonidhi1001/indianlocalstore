from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, Payment

class OrderItemInline(admin.TabularInline):
    """
    Inline admin descriptor for OrderItem models.
    Allows viewing the exact items purchased directly from the Order page.
    """
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price', 'variants']
    can_delete = False


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    readonly_fields = ['created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Order model.
    Architectural Note: Orders track the overall purchase. 
    OrderItem models track the specific products within the order.
    """
    list_display = ['order_id', 'user', 'final_amount', 'order_status', 'payment_status', 'created_at']
    list_filter = ['order_status', 'payment_status', 'created_at']
    search_fields = ['order_id', 'user__username', 'user__email']
    list_editable = ['order_status', 'payment_status']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_id', 'user', 'order_status', 'payment_status')
        }),
        ('Delivery Details', {
            'fields': ('delivery_address', 'delivery_city', 'delivery_state', 'delivery_pincode')
        }),
        ('Financials', {
            'fields': ('total_amount', 'shipping_charge', 'discount_amount', 'final_amount')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    readonly_fields = ['order_id', 'user', 'total_amount', 'shipping_charge', 'discount_amount', 'final_amount', 'created_at', 'updated_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for individual Order Items.
    """
    list_display = ['order', 'product', 'seller', 'quantity', 'price']
    list_filter = ['order__created_at']
    search_fields = ['order__order_id', 'product__name', 'seller__username']
    readonly_fields = ['order', 'product', 'seller', 'quantity', 'price', 'variants']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Payments (Razorpay integration).
    """
    list_display = ['order', 'amount', 'payment_method', 'status', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['order__order_id', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = ['order', 'amount', 'payment_method', 'razorpay_order_id', 'razorpay_payment_id', 'status', 'created_at']
