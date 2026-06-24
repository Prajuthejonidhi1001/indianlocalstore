from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import razorpay
import uuid
from django.conf import settings
from .models import Cart, CartItem, Order, OrderItem, Payment
from .serializers import (
    CartSerializer, CartItemSerializer, OrderListSerializer,
    OrderDetailSerializer, OrderCreateSerializer, PaymentSerializer
)


class CartViewSet(viewsets.ModelViewSet):
    """Shopping cart management"""
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        variants = request.data.get('variants', {})
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            variants=variants,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        CartItem.objects.filter(cart=cart, id=item_id).delete()
        return Response({'message': 'Item removed'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    def clear_cart(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    """Order management"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        return OrderListSerializer

    def perform_create(self, serializer):
        cart = get_object_or_404(Cart, user=self.request.user)
        
        if not cart.items.exists():
            raise serializers.ValidationError("Cart is empty")
        
        # Generate order ID
        order_id = f"ORD{uuid.uuid4().hex[:10].upper()}"
        
        # Create order
        order = Order.objects.create(
            user=self.request.user,
            order_id=order_id,
            total_amount=cart.get_total(),
            discount_amount=cart.get_total() - cart.get_discount_total(),
            final_amount=cart.get_discount_total(),
            **serializer.validated_data
        )
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
                discount_price=cart_item.product.discount_price,
                seller=cart_item.product.seller,
                variants=cart_item.variants
            )
        
        # Clear cart
        cart.items.all().delete()

    @action(detail=True, methods=['post'])
    def create_payment(self, request, pk=None):
        order = self.get_object()
        
        # Initialize Razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Create Razorpay order
        razorpay_order = client.order.create(
            amount=int(order.final_amount * 100),
            currency='INR',
            payment_capture=1
        )
        
        # Create payment entry
        payment = Payment.objects.create(
            order=order,
            user=request.user,
            payment_method='razorpay',
            amount=order.final_amount,
            razorpay_order_id=razorpay_order['id']
        )
        
        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'key_id': settings.RAZORPAY_KEY_ID,
            'amount': razorpay_order['amount'],
            'payment_id': payment.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        order = self.get_object()
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        # Verify payment
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            payment_data = {
                'razorpay_order_id': order.payment.razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            client.utility.verify_payment_signature(payment_data)
            
            # Update payment status
            payment = order.payment
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'success'
            payment.save()
            
            # Update order status
            order.payment_status = 'completed'
            order.order_status = 'confirmed'
            order.save()
            
            return Response({'message': 'Payment verified successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.order_status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Only pending or confirmed orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.order_status = 'cancelled'
        order.save()
        return Response({'message': 'Order cancelled successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def seller_orders(self, request):
        """Get orders that contain items from the current seller"""
        if request.user.role != 'seller':
            return Response({'error': 'Only sellers can access this'}, status=status.HTTP_403_FORBIDDEN)
            
        # Get all orders that have an item belonging to this seller
        orders = Order.objects.filter(items__seller=request.user).distinct()
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def dispatch_order(self, request, pk=None):
        """Seller dispatches the order to a hyper-local delivery partner"""
        if request.user.role != 'seller':
            return Response({'error': 'Only sellers can dispatch'}, status=status.HTTP_403_FORBIDDEN)
            
        order = self.get_object()
        
        # Verify the seller owns items in this order
        if not order.items.filter(seller=request.user).exists():
            return Response({'error': 'You cannot dispatch this order'}, status=status.HTTP_403_FORBIDDEN)
            
        if order.order_status not in ['pending', 'confirmed', 'processing']:
            return Response({'error': f'Order is already {order.order_status}'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            shop = request.user.shop
        except Exception:
            return Response({'error': 'You do not have a shop set up'}, status=status.HTTP_400_BAD_REQUEST)

        # Call delivery service
        from .delivery_service import delivery_service
        try:
            dispatch_info = delivery_service.create_hyperlocal_order(order, shop, order.user)
            
            # Update order tracking info
            order.tracking_id = dispatch_info.get('tracking_id')
            order.tracking_url = dispatch_info.get('tracking_url')
            order.order_status = 'shipped'
            order.save()
            
            return Response({
                'message': 'Order dispatched successfully via ' + dispatch_info.get('courier_name', 'Delivery Partner'),
                'tracking_url': dispatch_info.get('tracking_url'),
                'tracking_id': order.tracking_id
            })
        except Exception as e:
            return Response({'error': f'Failed to dispatch: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
