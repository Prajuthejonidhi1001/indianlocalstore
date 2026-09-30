from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, SubCategory, Product, ProductReview, ProductImage, Wishlist
from .serializers import (
    CategorySerializer, SubCategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductCreateUpdateSerializer, ProductReviewSerializer,
    WishlistSerializer
)
from .filters import ProductFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Get all categories and subcategories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class SubCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Get subcategories by category"""
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ProductViewSet(viewsets.ModelViewSet):
    """Product listing and management"""
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']

    @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        # 5 minute cache for products to balance performance with freshness
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view_count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @transaction.atomic
    def perform_create(self, serializer):
        # Force is_active=True so new products are immediately visible in shops
        product = serializer.save(seller=self.request.user, is_active=True)
        
        # Auto-assign category from shop if it exists
        if hasattr(self.request.user, 'shop'):
            shop = self.request.user.shop
            if shop.category:
                product.category = shop.category
            if shop.subcategory:
                product.subcategory = shop.subcategory
            product.save()

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
        qs = Product.objects.all()
        
        if self.request.user.is_authenticated and self.request.user.role == 'seller':
            if self.request.query_params.get('my_products'):
                return qs.filter(seller=self.request.user)
            if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
                return qs.filter(seller=self.request.user) | qs.filter(is_active=True)
        
        qs = qs.filter(is_active=True)

        shop_id = self.request.query_params.get('shop')
        if shop_id:
            from shops.models import Shop
            try:
                shop = Shop.objects.get(id=shop_id)
                return qs.filter(seller=shop.seller)
            except Shop.DoesNotExist:
                return qs.none()
        
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        product = self.get_object()
        
        # Check if user has purchased the product
        from orders.models import OrderItem
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            product=product
        ).exists()
        
        if not has_purchased:
            return Response({'detail': 'You must purchase this product before you can review it.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user already reviewed
        if ProductReview.objects.filter(product=product, user=request.user).exists():
            return Response({'detail': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = ProductReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            
            # Recalculate average rating
            reviews = ProductReview.objects.filter(product=product)
            product.reviews_count = reviews.count()
            avg_rating = sum([r.rating for r in reviews]) / product.reviews_count if product.reviews_count > 0 else 0
            product.rating = round(avg_rating, 1)
            product.save()
            
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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def search(self, request):
        """Search products by name or category"""
        query = request.query_params.get('q', '')
        products = Product.objects.filter(name__icontains=query, is_active=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    """Manage user wishlist"""
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        # Prevent duplicates
        if Wishlist.objects.filter(user=self.request.user, product=product).exists():
            raise serializers.ValidationError({"detail": "Product already in wishlist"})
        serializer.save(user=self.request.user)

