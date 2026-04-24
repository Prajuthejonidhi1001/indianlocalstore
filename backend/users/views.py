from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User


class AuthRateThrottle(AnonRateThrottle):
    rate = '10/minute'


from .serializers import (
    UserSerializer, UserRegisterSerializer,
    CustomTokenObtainPairSerializer, ProfileUpdateSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def forgot_password(self, request):
        """Generate a password reset token for the given username or email."""
        import secrets
        identifier = request.data.get('username') or request.data.get('email', '')
        if not identifier:
            return Response({'error': 'Provide username or email.'}, status=400)
        user = None
        try:
            user = User.objects.get(username=identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=identifier)
            except User.DoesNotExist:
                # Do not reveal whether account exists
                return Response({'message': 'If that account exists, a reset token has been generated.'})
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.save(update_fields=['password_reset_token'])
        return Response({
            'message': 'Reset token generated successfully.',
            'reset_token': token,
            'username': user.username,
        })

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        """Reset password using the token returned by forgot_password."""
        token = request.data.get('reset_token', '')
        new_password = request.data.get('new_password', '')
        if not token or not new_password:
            return Response({'error': 'reset_token and new_password are required.'}, status=400)
        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters.'}, status=400)
        try:
            user = User.objects.get(password_reset_token=token)
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired reset token.'}, status=400)
        user.set_password(new_password)
        user.password_reset_token = ''
        user.save(update_fields=['password', 'password_reset_token'])
        return Response({'message': 'Password reset successfully. You can now log in.'})


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
