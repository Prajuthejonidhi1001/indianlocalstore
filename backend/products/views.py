from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, SubCategory, Product, ProductReview, ProductImage
from .serializers import (
    CategorySerializer, SubCategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductCreateUpdateSerializer, ProductReviewSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Get all categories and subcategories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class SubCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Get subcategories by category"""
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']


class ProductViewSet(viewsets.ModelViewSet):
    """Product listing and management"""
    queryset = Product.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'subcategory', 'seller']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        # Force is_active=True so new products are immediately visible in shops
        product = serializer.save(seller=self.request.user, is_active=True)
        # Save additional uploaded images (up to 5 total)
        images = self.request.FILES.getlist('images')
        for i, img in enumerate(images[:5]):
            ProductImage.objects.create(product=product, image=img, order=i)

    def create(self, request, *args, **kwargs):
        """Override to return full ProductListSerializer data after creation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return full data with id, seller_name etc
        full_serializer = ProductListSerializer(serializer.instance, context={'request': request})
        headers = self.get_success_headers(full_serializer.data)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        qs = super().get_queryset()
        # Allow direct shop-based filtering — backend resolves Shop→seller→Products
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            from shops.models import Shop
            try:
                shop = Shop.objects.get(id=shop_id)
                return qs.filter(seller=shop.seller)
            except Shop.DoesNotExist:
                return qs.none()
        # seller filter (by user id) handled automatically by DjangoFilterBackend
        if self.request.user.is_authenticated and self.request.user.role == 'seller':
            if self.request.query_params.get('my_products'):
                return Product.objects.filter(seller=self.request.user)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        product = self.get_object()
        serializer = ProductReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """Get ALL seller's products (including inactive/drafts)"""
        if request.user.role != 'seller':
            return Response({'error': 'Only sellers can view this'}, status=status.HTTP_403_FORBIDDEN)
        
        products = Product.objects.filter(seller=request.user).order_by('-created_at')
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """Search products by name or category"""
        query = request.query_params.get('q', '')
        products = Product.objects.filter(name__icontains=query, is_active=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
