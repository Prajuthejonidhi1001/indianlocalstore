import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, Animated, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { shopAPI, productAPI, authAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

export default function ShopProductsScreen({ route, navigation }) {
  const { shopId, shopName } = route.params;
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const { addToCart, cartCount } = useCart();
  const { user } = useAuth();
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch wishlist on mount and when user changes
  useEffect(() => {
    if (user) {
      authAPI.getWishlist().then(res => {
        const wishlistProductIds = new Set(res.data.map(item => item.product));
        setWishlistItems(wishlistProductIds);
      }).catch(err => console.error('Failed to fetch wishlist:', err));
    }
  }, [user]);

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const [shopRes, prodRes] = await Promise.all([
        shopAPI.getShopDetail(shopId),
        productAPI.getProducts({ shop: shopId }),
      ]);
      setShop(shopRes.data);
      setProducts(prodRes.data.results || prodRes.data);
    } catch (error) {
      console.error('Error fetching shop detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e?.stopPropagation?.();
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }
    try {
      await authAPI.toggleWishlist(productId);
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) newSet.delete(productId);
        else newSet.add(productId);
        return newSet;
      });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity style={styles.backBtnLarge} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });
  const imageScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Sticky Header Nav */}
      <Animated.View style={[styles.stickyNav, { opacity: headerOpacity }]}>
        <Text style={styles.stickyNavTitle} numberOfLines={1}>{shop.name}</Text>
      </Animated.View>

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={22} color={COLORS.primary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Parallax Header */}
        <Animated.View style={[styles.parallaxHeader, { transform: [{ translateY: headerTranslateY }] }]}>
          <Animated.Image 
            source={{ uri: shop.banner_url || shop.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80' }} 
            style={[styles.bannerImg, { transform: [{ scale: imageScale }] }]} 
          />
          <View style={styles.bannerOverlay} />
        </Animated.View>

        {/* Shop Info Card */}
        <View style={styles.contentWrap}>
          <View style={styles.shopInfoCard}>
            <View style={styles.shopLogoWrap}>
              {shop.logo ? (
                <Image source={{ uri: shop.logo }} style={styles.shopLogo} />
              ) : (
                <View style={[styles.shopLogo, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={styles.shopLogoText}>{shop.name[0]?.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, paddingLeft: 16 }}>
              <Text style={styles.shopTitle} numberOfLines={1}>{shop.name}</Text>
              <Text style={styles.shopCatText}>{shop.category_name || 'Retail'} Ã‚Â· {shop.distance_km || '1.2'} km away</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="star" size={16} color={COLORS.secondary} />
              <Text style={styles.statVal}>{shop.rating?.toFixed(1) || '4.5'}</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="cube" size={16} color={COLORS.primary} />
              <Text style={styles.statVal}>{products.length} Items</Text>
            </View>
            <TouchableOpacity style={styles.statBox}>
              <Ionicons name="map" size={16} color={COLORS.textMuted} />
              <Text style={styles.statVal}>Map</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.shopDesc}>{shop.description || 'Welcome to our shop! We provide the best quality products for our local community.'}</Text>
          
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{shop.address || shop.city || 'Local Market Area'}</Text>
          </View>
          {shop.shop_code && (
            <View style={styles.metaRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.metaText}>ID: {String(shop.shop_code).slice(0, 8).toUpperCase()}</Text>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products in this shop..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.sectionHeading}>Product Catalog</Text>
          
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="cube-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((item) => {
                const isInWishlist = wishlistItems.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                    style={styles.productCard}
                  >
                    <View style={styles.imageWrap}>
                      <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' }} style={styles.productImg} />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={(e) => handleToggleWishlist(e, item.id)}
                        style={styles.heartBtn}
                      >
                        <Ionicons name={isInWishlist ? 'heart' : 'heart-outline'} size={18} color={isInWishlist ? COLORS.primary : COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                                          <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.productCat} numberOfLines={1}>{item.category_name}</Text>
                        <View style={styles.priceRow}>
                          <View>
                            {(() => { const pPrice = typeof item.price === 'object' && item.price !== null ? (item.price.price || item.price.Size) : item.price; return (<><Text style={styles.productPrice}>â‚¹{item.discount_price || pPrice}</Text>{item.discount_price && <Text style={{fontSize: 11, color: '#95a5a6', textDecorationLine: 'line-through'}}>â‚¹{pPrice}</Text>}</>);})()}
                          </View>
                          <TouchableOpacity style={styles.addCartBtn} onPress={() => addToCart(item.id)}>
                            <Ionicons name="add" size={18} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  backBtnLarge: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: RADIUS.md },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  topActions: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: COLORS.secondary, width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff'
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  stickyNav: {
    position: 'absolute', top: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#fff', zIndex: 9,
    justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 3
  },
  stickyNavTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, maxWidth: 200 },

  parallaxHeader: { height: HEADER_HEIGHT, width: '100%', position: 'absolute', top: 0 },
  bannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' },

  contentWrap: { marginTop: HEADER_HEIGHT - 40, backgroundColor: COLORS.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 16, minHeight: height },
  shopInfoCard: { flexDirection: 'row', alignItems: 'center', marginTop: -40, marginBottom: 20 },
  shopLogoWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  shopLogo: { width: 72, height: 72, borderRadius: 20, resizeMode: 'cover' },
  shopLogoText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  shopTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 4, letterSpacing: -0.5 },
  shopCatText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.elevated, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  shopDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metaText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, height: 48, borderRadius: RADIUS.md, paddingHorizontal: 16, marginTop: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.text },

  sectionHeading: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16, letterSpacing: -0.3 },

  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12 },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: (width - 44) / 2, backgroundColor: COLORS.elevated, borderRadius: RADIUS.md, marginBottom: 16, ...SHADOWS.small, overflow: 'hidden' },
  imageWrap: { width: '100%', height: 140, position: 'relative' },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  productCat: { fontSize: 11, color: COLORS.textMuted, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  addCartBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.text, justifyContent: 'center', alignItems: 'center' },
});

