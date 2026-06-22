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


class AuthRateThrottle(AnonRateThrottle):
    rate = '10/minute'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def send_otp(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email is already registered
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)
        
        OTPVerification.objects.create(email=email, otp_code=otp_code, expires_at=expires_at)
        
        # Beautiful HTML Email Template
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #FF6B35; text-align: center;">Indian Local Store</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Please use the verification code below to complete your registration. This code is valid for 10 minutes.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">{otp_code}</span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
        """
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                'Your Verification Code - Indian Local Store',
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print("Email sending failed:", str(e))
            return Response({'error': f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)

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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def forgot_password(self, request):
        """Generate a 6-digit OTP and send to the user's email."""
        email = request.data.get('email', '')
        if not email:
            return Response({'error': 'Provide email.'}, status=400)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Do not reveal whether account exists
            return Response({'message': 'If that account exists, an OTP has been sent.'})
            
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)
        OTPVerification.objects.create(email=email, otp_code=otp_code, expires_at=expires_at)

        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #FF6B35; text-align: center;">Password Reset</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Please use the verification code below to reset your password. This code is valid for 10 minutes.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">{otp_code}</span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
        """
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                'Password Reset Code - Indian Local Store',
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print("Email sending failed:", str(e))
            return Response({'error': f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({
            'message': 'OTP generated successfully.',
            'username': user.username,
        })

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        """Reset password using OTP verification."""
        email = request.data.get('email', '')
        otp = request.data.get('otp', '')
        new_password = request.data.get('new_password', '')
        
        if not email or not otp or not new_password:
            return Response({'error': 'email, otp, and new_password are required.'}, status=400)
            
        import re
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=400)
        if not re.search(r'[A-Z]', new_password):
            return Response({'error': 'Password must contain at least one uppercase letter.'}, status=400)
        if not re.search(r'[a-z]', new_password):
            return Response({'error': 'Password must contain at least one lowercase letter.'}, status=400)
        if not re.search(r'[0-9]', new_password):
            return Response({'error': 'Password must contain at least one number.'}, status=400)
        if not re.search(r'[^A-Za-z0-9]', new_password):
            return Response({'error': 'Password must contain at least one special character.'}, status=400)
            
        try:
            otp_record = OTPVerification.objects.filter(email=email).latest('created_at')
            if otp_record.otp_code != otp:
                return Response({'error': 'Invalid OTP code.'}, status=400)
            if otp_record.expires_at < timezone.now():
                return Response({'error': 'OTP has expired.'}, status=400)
                
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            otp_record.delete()
            return Response({'message': 'Password has been reset successfully.'})
        except OTPVerification.DoesNotExist:
            return Response({'error': 'Please request an OTP first.'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
