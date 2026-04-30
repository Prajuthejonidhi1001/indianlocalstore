from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'first_name', 'last_name', 
                  'role', 'profile_image', 'address', 'city', 'state', 'pincode', 
                  'latitude', 'longitude', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'password2', 'first_name', 
                  'last_name', 'role']
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True}
        }

    def validate(self, data):
        password2 = data.pop('password2', None)
        if password2 and data['password'] != password2:
            raise serializers.ValidationError("Passwords don't match")

        # Convert empty phone to None so unique constraint allows multiple users with no phone
        if 'phone' in data and not data['phone']:
            data['phone'] = None

        password = data['password']
        if len(password) < 8:
            raise serializers.ValidationError({"password": ["Password must be at least 8 characters."]})
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({"password": ["Password must contain at least one uppercase letter."]})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({"password": ["Password must contain at least one lowercase letter."]})
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({"password": ["Password must contain at least one number."]})
        if not re.search(r'[^A-Za-z0-9]', password):
            raise serializers.ValidationError({"password": ["Password must contain at least one special character."]})

        return data

    def create(self, validated_data):
        # Ensure empty phone becomes None (not "") to avoid unique constraint collision
        if 'phone' in validated_data and not validated_data['phone']:
            validated_data['phone'] = None
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        return token


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'profile_image', 'address', 
                  'city', 'state', 'pincode', 'latitude', 'longitude']
