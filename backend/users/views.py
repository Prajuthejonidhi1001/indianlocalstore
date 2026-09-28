from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User, OTPVerification, Address
from .serializers import (
    UserSerializer, UserRegisterSerializer,
    CustomTokenObtainPairSerializer, ProfileUpdateSerializer, AddressSerializer
)
from .permissions import IsAdminUser
from shops.models import Shop
from products.models import Product
from orders.models import Order
from django.db.models import Sum
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

import uuid
import os
import requests
from decouple import config

class AuthRateThrottle(AnonRateThrottle):
    rate = '10/minute'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def send_otp(self, request):
        phone = request.data.get('phone')
        email = request.data.get('email', '').strip()
        
        if not email and not phone:
            return Response({'message': 'No email or phone provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        email_otp = f"{random.randint(100000, 999999)}" if email else None
        expires_at = timezone.now() + timedelta(minutes=10)
        
        OTPVerification.objects.create(
            phone=phone, 
            email=email,
            phone_otp=None,
            email_otp=email_otp, 
            expires_at=expires_at
        )
            
        # ── EMAIL INTEGRATION ──
        if email:
            html_message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #FF6B35; text-align: center;">Indian Local Store</h2>
                <p>Hello,</p>
                <p>Your email verification code is:</p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; text-align: center;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">{email_otp}</span>
                </div>
            </div>
            """
            try:
                send_mail(
                    'Your Verification Code',
                    strip_tags(html_message),
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    html_message=html_message,
                    fail_silently=True,
                )
            except Exception as e:
                print("Email sending failed:", str(e))
                
        return Response({'message': 'OTPs sent successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def verify_otp(self, request):
        firebase_token = request.data.get('firebase_token')
        email_otp = request.data.get('email_otp')
        email = request.data.get('email')
        phone = None
        verified_email = ''

        if firebase_token:
            firebase_api_key = config('VITE_FIREBASE_API_KEY', default='AIzaSyC4Yhpk0zw-Om-mNWSFn4mwQOy97tufzHE')
            url = f'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}'
            resp = requests.post(url, json={'idToken': firebase_token})
            
            if resp.status_code != 200:
                error_msg = resp.json().get('error', {}).get('message', 'INVALID_ID_TOKEN')
                return Response({'error': f'Invalid Firebase ID Token: {error_msg}'}, status=status.HTTP_401_UNAUTHORIZED)
                
            user_data = resp.json().get('users', [{}])[0]
            phone = user_data.get('phoneNumber')
            if not phone:
                return Response({'error': 'Token does not contain a valid phone number.'}, status=status.HTTP_400_BAD_REQUEST)
            phone = phone.replace(' ', '').replace('-', '')
            
        if email_otp:
            try:
                if email:
                    otp_record = OTPVerification.objects.filter(email=email).latest('created_at')
                elif phone:
                    otp_record = OTPVerification.objects.filter(phone=phone).latest('created_at')
                else:
                    return Response({'error': 'No identifier for email OTP.'}, status=status.HTTP_400_BAD_REQUEST)
                
                if otp_record.expires_at < timezone.now():
                    return Response({'error': 'Email OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
                if otp_record.email_otp != email_otp:
                    return Response({'error': 'Invalid Email OTP code.'}, status=status.HTTP_400_BAD_REQUEST)
                    
                verified_email = otp_record.email
                otp_record.delete()
            except OTPVerification.DoesNotExist:
                return Response({'error': 'Please request an Email OTP first.'}, status=status.HTTP_400_BAD_REQUEST)

        if not phone and not verified_email:
            return Response({'error': 'Must provide either a valid Firebase token or Email OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if verified_email and not phone:
            user = User.objects.filter(email=verified_email).first()
            if not user:
                return Response({'error': 'No account found with this email. Please register.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={
                    'username': f"user_{uuid.uuid4().hex[:8]}",
                    'email': verified_email,
                    'role': request.data.get('role', 'customer'),
                    'first_name': request.data.get('first_name', ''),
                    'last_name': request.data.get('last_name', '')
                }
            )
            if verified_email and user.email != verified_email:
                user.email = verified_email
                user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'is_new_user': created if 'created' in locals() else False
        })

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def sellers(self, request):
        sellers = User.objects.filter(role='seller')
        serializer = self.get_serializer(sellers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Blacklist the refresh token to enforce server-side logout."""
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        is_default = serializer.validated_data.get('is_default', False)
        if is_default or not Address.objects.filter(user=self.request.user).exists():
            Address.objects.filter(user=self.request.user).update(is_default=False)
            serializer.validated_data['is_default'] = True
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save()

class AdminViewSet(viewsets.ViewSet):
    """
    Super Admin endpoints for Dashboard stats and user/shop management.
    """
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_users = User.objects.count()
        total_shops = Shop.objects.count()
        total_products = Product.objects.count()
        
        # Calculate revenue for non-cancelled orders
        revenue_data = Order.objects.exclude(order_status='cancelled').aggregate(total_revenue=Sum('final_amount'))
        total_revenue = revenue_data['total_revenue'] or 0

        # Fetch recent orders (last 5)
        recent_orders = Order.objects.all().order_by('-created_at')[:5]
        from orders.serializers import OrderListSerializer
        orders_data = OrderListSerializer(recent_orders, many=True).data

        return Response({
            'total_users': total_users,
            'total_shops': total_shops,
            'total_products': total_products,
            'total_revenue': total_revenue,
            'recent_orders': orders_data
        })

    @action(detail=False, methods=['get'])
    def users(self, request):
        users = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def shops(self, request):
        shops = Shop.objects.all().order_by('-created_at')
        from shops.serializers import ShopListSerializer
        serializer = ShopListSerializer(shops, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def orders(self, request):
        orders = Order.objects.all().order_by('-created_at')
        from orders.serializers import OrderListSerializer
        serializer = OrderListSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_role(self, request, pk=None):
        try:
            user_to_update = User.objects.get(pk=pk)
            new_role = request.data.get('role')
            if new_role not in [choice[0] for choice in User.ROLE_CHOICES]:
                return Response({'error': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_to_update.role = new_role
            user_to_update.save()
            return Response({'message': 'Role updated successfully.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def verify_shop(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
            # Assuming verification_status exists on Shop model
            shop.verification_status = 'verified'
            shop.save()
            return Response({'message': 'Shop verified successfully.'})
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

