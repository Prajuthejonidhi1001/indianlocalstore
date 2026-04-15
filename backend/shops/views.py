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
        """Get nearby shops based on user location"""
        city = request.query_params.get('city')
        shops = Shop.objects.filter(is_active=True)
        
        if city and city != 'undefined':
            shops = shops.filter(city__icontains=city)
            
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
