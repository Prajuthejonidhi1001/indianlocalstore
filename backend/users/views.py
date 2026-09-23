from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User, Wishlist
from .serializers import (
    UserSerializer, UserRegisterSerializer,
    CustomTokenObtainPairSerializer, ProfileUpdateSerializer, WishlistSerializer
)
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
from .models import OTPVerification
import uuid
import requests

class AuthRateThrottle(AnonRateThrottle):
    rate = '10/minute'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def send_otp(self, request):
        phone = request.data.get('phone')
        email = request.data.get('email')
        if email:
            email = str(email).strip()
        
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
    def check_user(self, request):
        phone = request.data.get('phone')
        email = request.data.get('email')
        if email:
            email = str(email).strip()
        
        if not phone and not email:
            return Response({'error': 'No phone or email provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        exists = False
        if email:
            exists = User.objects.filter(email=email).exists()
        elif phone:
            phone = phone.replace(' ', '').replace('-', '').replace('+91', '')
            exists = User.objects.filter(phone=phone).exists()
            
        return Response({'exists': exists}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def verify_otp(self, request):
        firebase_token = request.data.get('firebase_token')
        email_otp = request.data.get('email_otp')
        email = request.data.get('email')
        phone = None
        verified_email = ''

        if firebase_token:
            if not settings.FIREBASE_WEB_API_KEY:
                return Response(
                    {'error': 'Phone verification is not configured on the server.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            url = (
                'https://identitytoolkit.googleapis.com/v1/accounts:lookup'
                f'?key={settings.FIREBASE_WEB_API_KEY}'
            )
            # Always pass a timeout. Without one a stalled connection to Google
            # holds the gunicorn worker open indefinitely, which on a
            # single-worker free plan takes the whole API down.
            try:
                resp = requests.post(url, json={'idToken': firebase_token}, timeout=10)
            except requests.RequestException:
                return Response(
                    {'error': 'Could not reach the verification service. Please try again.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

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
    def verify_email_only(self, request):
        email = request.data.get('email', '')
        if email: email = str(email).strip()
        email_otp = request.data.get('email_otp', '')
        if email_otp: email_otp = str(email_otp).strip()

        if not email or not email_otp:
            return Response({'error': 'Email and OTP required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            otp_record = OTPVerification.objects.filter(email=email).latest('created_at')
            if otp_record.expires_at < timezone.now():
                return Response({'error': 'Email OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            if otp_record.email_otp != email_otp:
                return Response({'error': 'Invalid Email OTP code.'}, status=status.HTTP_400_BAD_REQUEST)
            
            otp_record.is_verified = True
            otp_record.save()
            return Response({'success': True, 'message': 'Email verified successfully.'})
        except OTPVerification.DoesNotExist:
            return Response({'error': 'Please request an Email OTP first.'}, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_wishlist(self, request):
        """Add or remove a product from wishlist"""
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product_id=product_id
        )

        if not created:
            # Item already exists, remove it
            wishlist_item.delete()
            return Response({'message': 'Removed from wishlist', 'in_wishlist': False})
        else:
            # Item was created, added to wishlist
            serializer = WishlistSerializer(wishlist_item)
            return Response({
                'message': 'Added to wishlist',
                'in_wishlist': True,
                'wishlist_item': serializer.data
            }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def wishlist(self, request):
        """Get user's wishlist"""
        wishlist_items = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(wishlist_items, many=True)
        return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
