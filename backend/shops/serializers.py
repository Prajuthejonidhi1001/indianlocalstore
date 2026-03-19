from rest_framework import serializers
from .models import Shop, ShopReview, ShopService


class ShopReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ShopReview
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class ShopServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopService
        fields = ['id', 'name', 'description', 'price', 'icon']


class ShopListSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ['id', 'name', 'logo', 'city', 'rating', 'reviews_count', 
                  'verification_status', 'distance']

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'latitude') and request.user.latitude:
            from math import radians, cos, sin, asin, sqrt
            lat1, lon1 = request.user.latitude, request.user.longitude
            lat2, lon2 = obj.latitude, obj.longitude
            
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            km = 6371 * c
            return round(km, 2)
        return None


class ShopDetailSerializer(serializers.ModelSerializer):
    seller = serializers.StringRelatedField(read_only=True)
    shop_reviews = ShopReviewSerializer(many=True, read_only=True)
    services = ShopServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Shop
        fields = ['id', 'name', 'description', 'logo', 'banner', 'address', 'city', 
                  'state', 'pincode', 'phone', 'email', 'rating', 'reviews_count',
                  'opening_time', 'closing_time', 'verification_status', 'seller',
                  'shop_reviews', 'services', 'created_at']


class ShopCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['name', 'description', 'logo', 'banner', 'latitude', 'longitude',
                  'address', 'city', 'state', 'pincode', 'phone', 'email',
                  'opening_time', 'closing_time']
