from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User
from .serializers import (
    UserSerializer, UserRegisterSerializer,
    CustomTokenObtainPairSerializer, ProfileUpdateSerializer
)
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import OTPVerification
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
        
        if not phone:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Clean phone number
        phone = phone.replace(' ', '').replace('-', '')
        if not phone.startswith('+91'):
            if len(phone) == 10:
                phone = '+91' + phone
            else:
                return Response({'error': 'Please enter a valid 10-digit Indian phone number.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # With Firebase, the frontend handles the phone SMS directly.
        # This endpoint is now ONLY for generating the Email OTP.
        if not email:
            return Response({'message': 'No email provided.'}, status=status.HTTP_200_OK)
            
        email_otp = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)
        
        OTPVerification.objects.create(
            phone=phone, 
            email=email,
            phone_otp=None, # Not used anymore, Firebase handles it
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
        
        if not firebase_token:
            return Response({'error': 'Firebase token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # 1. Verify the Firebase token using REST API
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
            
            # Format phone just in case, Firebase usually returns it with +91 already
            phone = phone.replace(' ', '').replace('-', '')
            
            # 2. If email_otp was provided, verify it against our database
            verified_email = ''
            if email_otp:
                try:
                    otp_record = OTPVerification.objects.filter(phone=phone).latest('created_at')
                    
                    if otp_record.expires_at < timezone.now():
                        return Response({'error': 'Email OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
                        
                    if not otp_record.email:
                        return Response({'error': 'No email was registered for this session.'}, status=status.HTTP_400_BAD_REQUEST)
                        
                    if otp_record.email_otp != email_otp:
                        return Response({'error': 'Invalid Email OTP code.'}, status=status.HTTP_400_BAD_REQUEST)
                        
                    verified_email = otp_record.email
                    otp_record.delete()
                except OTPVerification.DoesNotExist:
                    return Response({'error': 'Please request an Email OTP first.'}, status=status.HTTP_400_BAD_REQUEST)
                    
            # Both valid (or only phone required). Get or create user.
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
            
            # Update email if they provided one now but didn't have one before
            if verified_email and not user.email:
                user.email = verified_email
                user.save()
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'is_new_user': created
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
