from rest_framework import serializers
from .models import Category, SubCategory, Product, ProductReview


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'category', 'name', 'icon']

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'subcategories']


class ProductReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'discount_price', 'discount_percentage',
                  'image', 'rating', 'stock', 'category_name', 'seller_name']

    def get_discount_percentage(self, obj):
        return obj.get_discount_percentage()


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    product_reviews = ProductReviewSerializer(many=True, read_only=True)
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'discount_price', 
                  'discount_percentage', 'stock', 'image', 'rating', 'reviews_count',
                  'category', 'subcategory', 'seller', 'product_reviews', 'created_at']

    def get_discount_percentage(self, obj):
        return obj.get_discount_percentage()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['category', 'subcategory', 'name', 'description', 'price', 
                  'discount_price', 'stock', 'image', 'is_active']
