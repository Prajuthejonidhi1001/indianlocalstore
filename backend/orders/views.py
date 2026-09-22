from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
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
        """Turn the caller's cart into an order.

        Three things here are deliberate:

        1. Everything runs inside one transaction. Without it, a client that
           double-submits (or retries after a network blip) could create a
           second order from a cart that was already half consumed.
        2. Amounts come from `cart`, never from the request body. The client
           sends no money fields -- the serializer marks them read-only -- so
           there is no way to pay 1 rupee for a 1000 rupee basket.
        3. `serializer.instance` is set at the end. DRF builds the response
           from the serializer, so without this the create response comes back
           with no `id` and no `order_id`, and the confirmation screen shows
           "Order placed! ID: undefined".
        """
        with transaction.atomic():
            # select_for_update so two concurrent submits serialise instead of
            # both reading a non-empty cart and both creating an order.
            cart = (
                Cart.objects
                .select_for_update()
                .filter(user=self.request.user)
                .first()
            )

            # The `error` key is what both front ends read out of a failed
            # response, so the customer sees this sentence rather than a
            # generic "Failed to place order".
            if cart is None or not cart.items.exists():
                raise serializers.ValidationError(
                    {'error': 'Your cart is empty.'}
                )

            cart_items = list(cart.items.select_related('product', 'product__seller'))

            missing = [i for i in cart_items if i.product is None]
            if missing:
                raise serializers.ValidationError(
                    {'error': 'Some items are no longer available. Please review your cart.'}
                )

            total = cart.get_total()
            payable = cart.get_discount_total()
            payment_method = serializer.validated_data.get('payment_method', 'cod')

            # Cash on delivery needs no further action from the customer, so the
            # order is accepted immediately and the seller can act on it. An
            # online order stays pending until the payment signature verifies.
            order_status = 'confirmed' if payment_method == 'cod' else 'pending'

            order = Order.objects.create(
                user=self.request.user,
                order_id=f"ORD{uuid.uuid4().hex[:10].upper()}",
                total_amount=total,
                discount_amount=total - payable,
                final_amount=payable,
                order_status=order_status,
                payment_status='pending',
                **serializer.validated_data
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price,
                    discount_price=item.product.discount_price,
                    seller=item.product.seller,
                    variants=item.variants,
                )
                for item in cart_items
            ])

            cart.items.all().delete()

        # Makes the response body carry the real order, including order_id.
        serializer.instance = order

    @action(detail=True, methods=['post'])
    def create_payment(self, request, pk=None):
        order = self.get_object()

        # Online payment is off until Razorpay live keys are in place. Without
        # this guard razorpay.Client is built with None credentials and the
        # request dies as an unexplained 500.
        if not (settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET):
            return Response(
                {'error': 'Online payment is not available yet. Please choose Cash on Delivery.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if order.payment_status == 'completed':
            return Response(
                {'error': 'This order is already paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        try:
            razorpay_order = client.order.create(
                amount=int(order.final_amount * 100),
                currency='INR',
                payment_capture=1
            )
        except Exception:
            # Never surface the raw gateway error -- it can leak key ids.
            return Response(
                {'error': 'Could not start the payment. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # An order has one payment row (OneToOne), so a retried payment must
        # update the existing row instead of raising IntegrityError.
        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults={
                'user': request.user,
                'payment_method': 'razorpay',
                'amount': order.final_amount,
                'razorpay_order_id': razorpay_order['id'],
                'status': 'initiated',
            },
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

        if not (razorpay_payment_id and razorpay_signature):
            return Response(
                {'error': 'Missing payment confirmation details.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.filter(order=order).first()
        if payment is None or not payment.razorpay_order_id:
            return Response(
                {'error': 'No payment was started for this order.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': payment.razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except Exception:
            # A bad signature means the callback was forged or tampered with.
            # Record the failure and refuse -- and do not echo the exception,
            # which would tell an attacker how the check failed.
            payment.status = 'failed'
            payment.save(update_fields=['status'])
            return Response(
                {'error': 'Payment could not be verified.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'success'
            payment.save()

            order.payment_status = 'completed'
            order.order_status = 'confirmed'
            order.payment_id = razorpay_payment_id
            order.save(update_fields=['payment_status', 'order_status', 'payment_id'])

        return Response({'message': 'Payment verified successfully'}, status=status.HTTP_200_OK)

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
