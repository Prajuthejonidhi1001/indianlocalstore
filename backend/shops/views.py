from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Shop, ShopReview, ShopService
from .serializers import (
    ShopListSerializer, ShopDetailSerializer, ShopCreateUpdateSerializer,
    ShopReviewSerializer
)


class ShopViewSet(viewsets.ModelViewSet):
    """Shop listing and management"""
    queryset = Shop.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'verification_status']
    search_fields = ['name', 'address', 'city']
    ordering_fields = ['rating', 'reviews_count', 'created_at']
    ordering = ['-rating']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ShopDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ShopCreateUpdateSerializer
        return ShopListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my_shop']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        if self.request.user.role != 'seller':
            raise PermissionDenied('Only sellers can create shops.')
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_shop(self, request):
        """Get seller's shop"""
        try:
            shop = request.user.shop
            serializer = ShopDetailSerializer(shop, context={'request': request})
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def nearby(self, request):
        """Get nearby shops based on user location using Haversine distance"""
        import math

        lat_str = request.query_params.get('latitude')
        lng_str = request.query_params.get('longitude')
        city = request.query_params.get('city')
        
        shops = Shop.objects.filter(is_active=True)

        if lat_str and lng_str:
            try:
                user_lat = float(lat_str)
                user_lng = float(lng_str)
            except ValueError:
                return Response({'error': 'Invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)

            # Python Haversine calculation
            def haversine(lat1, lon1, lat2, lon2):
                R = 6371  # Earth radius in kilometers
                dLat = math.radians(lat2 - lat1)
                dLon = math.radians(lon2 - lon1)
                a = math.sin(dLat/2) * math.sin(dLat/2) + \
                    math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
                    math.sin(dLon/2) * math.sin(dLon/2)
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                return R * c

            # Fetch all active shops and sort by distance in memory
            shop_list = list(shops)
            for shop in shop_list:
                shop.distance = haversine(user_lat, user_lng, shop.latitude, shop.longitude)
            
            # Sort by distance
            shop_list.sort(key=lambda s: s.distance)
            
            serializer = ShopListSerializer(shop_list, many=True, context={'request': request})
            return Response(serializer.data)
            
        elif city and city != 'undefined':
            shops = shops.filter(city__icontains=city).order_by('-rating')
            serializer = ShopListSerializer(shops, many=True, context={'request': request})
            return Response(serializer.data)
        else:
            # Default fallback
            shops = shops.order_by('-rating')
            serializer = ShopListSerializer(shops, many=True, context={'request': request})
            return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        shop = self.get_object()
        serializer = ShopReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(shop=shop, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
