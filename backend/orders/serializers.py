from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Payment


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_image', 'product_price', 'variants', 'quantity', 'total']

    def get_total(self, obj):
        return str(obj.get_total())


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    discount_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'discount_total']

    def get_total(self, obj):
        return str(obj.get_total())

    def get_discount_total(self, obj):
        return str(obj.get_discount_total())


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['product', 'product_name', 'quantity', 'price', 'discount_price', 'seller_name', 'variants']


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'total_amount', 'final_amount', 'order_status', 'payment_status', 'delivery_city', 'tracking_url', 'created_at']


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_id', 'total_amount', 'discount_amount', 'shipping_charge',
                  'final_amount', 'order_status', 'payment_status', 'delivery_address',
                  'delivery_city', 'delivery_state', 'delivery_pincode', 'tracking_id',
                  'tracking_url', 'items', 'created_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Input and response body for POST /api/orders/orders/.

    Only the delivery fields and the payment method are writable. Every money
    field is read-only on purpose: the view recomputes the amounts from the
    server-side cart, so a tampered request body cannot change what the
    customer is charged.

    The read-only fields matter for the response too. The client shows the
    order number on the confirmation screen, so `id` and `order_id` have to
    come back in the create response.
    """

    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('razorpay', 'Razorpay'),
    ]

    payment_method = serializers.ChoiceField(
        choices=PAYMENT_METHOD_CHOICES,
        default='cod',
    )

    class Meta:
        model = Order
        fields = [
            'id', 'order_id',
            'delivery_address', 'delivery_city', 'delivery_state', 'delivery_pincode',
            'payment_method',
            'total_amount', 'discount_amount', 'final_amount',
            'order_status', 'payment_status', 'created_at',
        ]
        read_only_fields = [
            'id', 'order_id',
            'total_amount', 'discount_amount', 'final_amount',
            'order_status', 'payment_status', 'created_at',
        ]

    def validate_delivery_pincode(self, value):
        pincode = (value or '').strip()
        if not (pincode.isdigit() and len(pincode) == 6):
            raise serializers.ValidationError(
                'Enter a valid 6-digit Indian pincode.'
            )
        return pincode


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'payment_method', 'amount', 'razorpay_order_id', 'status']
        read_only_fields = ['id', 'razorpay_order_id', 'status']
