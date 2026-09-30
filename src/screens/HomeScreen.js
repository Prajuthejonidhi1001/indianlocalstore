import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, Dimensions, ActivityIndicator,
  FlatList, Animated, ImageBackground, Platform, SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, RADIUS, TYPOGRAPHY } from '../constants';
import { shopAPI, productAPI, authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const CAT_EMOJIS = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Dairy': '🧀', 'Spices': '🌶️',
  'Grains': '🌾', 'Snacks': '🥨', 'Meat': '🥩', 'Beverages': '🥤',
  'Bakery': '🥐', 'Personal Care': '🧴', 'Home & Living': '🛋️',
  'Electronics': '💻', 'Clothing': '👕', 'Pharmacy': '💊',
  'Fashion': '👗', 'Agriculture': '🚜', 'Automobile': '🚗',
  'Construction': '🏗️', 'Furniture': '🪑', 'Furnitures': '🪑',
  'Mart': '🏪', 'Traders': '🏬', 'Event Management': '🎉',
  'Second Hand Vehicles': '🛵',
};

const HERO_BANNERS = [
  { id: 1, title: 'Mega Electronics Sale', subtitle: 'Up to 40% Off on Top Brands', colors: ['#1e3c72', '#2a5298'], image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop' },
  { id: 2, title: 'Fresh Groceries Delivered', subtitle: 'In 30 Minutes or Less', colors: ['#11998e', '#38ef7d'], image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Fashion Clearance', subtitle: 'Trendy Styles at Unbeatable Prices', colors: ['#ff9a9e', '#fecfef'], image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop' }
];

const CAT_GRADIENTS = [
  ['#FF9A9E', '#FECFEF'],
  ['#a18cd1', '#fbc2eb'],
  ['#84fab0', '#8fd3f4'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { location, setLocation } = useLocation();
  const { cartItems } = useCart();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600 * 5);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, [location?.district]);
  
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const autoScroll = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= HERO_BANNERS.length) nextIndex = 0;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);
    return () => clearInterval(autoScroll);
  }, [currentIndex]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts({ page_size: 15 })
      ]);
      setCategories(catRes.data.results || catRes.data);
      setTrendingProducts(prodRes.data.results || prodRes.data);
      
      try {
        const shopRes = await shopAPI.getShops({ page_size: 8, city: location?.district });
        let shopData = shopRes.data.results || shopRes.data;
        if (shopData.length === 0) {
          const allShopRes = await shopAPI.getShops({ page_size: 8 });
          shopData = allShopRes.data.results || allShopRes.data;
        }
        setShops(shopData);
      } catch (e) { console.error('Shop fetch error:', e); }
      
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerGPS = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return alert('Location permission denied');
      let loc = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      let city = geocode[0]?.city || geocode[0]?.subregion || geocode[0]?.district || 'Unknown Location';
      setLocation({ name: city, district: city, coords: { lat: loc.coords.latitude, lng: loc.coords.longitude }});
      
      const res = await shopAPI.getNearbyShops({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setShops(res.data.results || res.data);
    } catch (e) {
      console.error('GPS error:', e);
      alert('Failed to get location');
    } finally { setLocating(false); }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return ${h.toString().padStart(2, '0')}h : m : s;
  };

  const renderBanner = ({ item }) => (
    <View style={styles.bannerSlide}>
      <LinearGradient colors={item.colors} style={styles.bannerGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Image source={{ uri: item.image }} style={styles.bannerImage} />
        <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.bannerOverlay} start={{x: 0, y: 0.5}} end={{x: 1, y: 0.5}} />
        <View style={styles.bannerContent}>
          <View style={styles.ltoBadge}><Text style={styles.ltoText}>Limited Time Offer</Text></View>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.bannerBtnText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Sticky Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Hello, {user?.first_name || 'Guest'} 👋</Text>
            <TouchableOpacity style={styles.locationSelector} onPress={triggerGPS}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {locating ? 'Locating...' : (location?.name || 'Set your location')}
              </Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
              <Ionicons name="search" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
              <Ionicons name="cart-outline" size={24} color={COLORS.text} />
              {cartItems?.length > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{cartItems.length}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Animated Hero Carousel */}
        <View style={styles.heroContainer}>
          <FlatList
            ref={flatListRef}
            data={HERO_BANNERS}
            renderItem={renderBanner}
            keyExtractor={item => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentIndex(idx);
            }}
          />
          <View style={styles.dotsContainer}>
            {HERO_BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Categories Grid (Vibrant) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.slice(0, 10).map((cat, idx) => {
              const gradient = CAT_GRADIENTS[idx % CAT_GRADIENTS.length];
              return (
                <TouchableOpacity key={cat.id} style={styles.catWrap} onPress={() => navigation.navigate('ShopList', { categoryId: cat.id })}>
                  <LinearGradient colors={gradient} style={styles.catCircle}>
                    <Text style={styles.catEmoji}>{CAT_EMOJIS[cat.name] || '🛍️'}</Text>
                  </LinearGradient>
                  <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Flash Deals with Timer */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <Ionicons name="flash" size={24} color="#FF6B35" />
                <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Flash Deals</Text>
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {trendingProducts.map(product => (
                <TouchableOpacity key={product.id} style={styles.flashCard} onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}>
                  <Image source={{ uri: product.image || 'https://via.placeholder.com/150' }} style={styles.flashImage} />
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-20%</Text>
                  </View>
                  <View style={styles.flashInfo}>
                    <Text style={styles.flashName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.flashPriceRow}>
                      <Text style={styles.flashPrice}>₹{product.price}</Text>
                      <Text style={styles.flashOldPrice}>₹{(product.price * 1.2).toFixed(0)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Premium Shops Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="storefront" size={22} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Premium Local Shops</Text>
            </View>
          </View>
          
          <View style={styles.shopGrid}>
            {shops.map((shop, idx) => (
              <TouchableOpacity key={shop.id} style={styles.shopCard} onPress={() => navigation.navigate('ShopList', { categoryId: shop.category })}>
                <ImageBackground 
                  source={{ uri: shop.banner_image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop' }} 
                  style={styles.shopBanner} 
                  imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                >
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.shopBannerOverlay} />
                  <View style={styles.shopRating}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.shopRatingText}>{shop.rating}</Text>
                  </View>
                </ImageBackground>
                
                <View style={styles.shopInfo}>
                  <Image source={{ uri: shop.logo || 'https://via.placeholder.com/100' }} style={styles.shopLogo} />
                  <View style={styles.shopTextWrap}>
                    <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                    <Text style={styles.shopDesc} numberOfLines={1}>{shop.address}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  locationSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 16, fontWeight: '800', color: COLORS.text, maxWidth: 200 },
  headerActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  iconBtn: { padding: 4, position: 'relative' },
  badge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30',
    minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF'
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 40 },
  
  heroContainer: { height: 200, marginTop: 16, paddingHorizontal: 16 },
  bannerSlide: { width: width - 32, height: 200, borderRadius: 20, overflow: 'hidden' },
  bannerGradient: { flex: 1 },
  bannerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.6 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  bannerContent: { flex: 1, justifyContent: 'center', padding: 24, paddingRight: 80 },
  ltoBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  ltoText: { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  bannerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8, lineHeight: 30 },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginBottom: 16 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, alignSelf: 'flex-start', gap: 6 },
  bannerBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 12, width: '100%' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 3 },
  dotActive: { width: 16, backgroundColor: '#FFF' },

  section: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  seeAllText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  
  catScroll: { paddingHorizontal: 20 },
  catWrap: { alignItems: 'center', marginRight: 20, width: 70 },
  catCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  catEmoji: { fontSize: 28 },
  catName: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  timerBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 12 },
  timerText: { color: '#FFF', fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
  
  hScroll: { paddingHorizontal: 20 },
  flashCard: { width: 150, backgroundColor: '#FFF', borderRadius: 16, marginRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  flashImage: { width: '100%', height: 130, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#F0F0F0' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  flashInfo: { padding: 12 },
  flashName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8, height: 36, lineHeight: 18 },
  flashPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashPrice: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  flashOldPrice: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'line-through' },

  shopGrid: { paddingHorizontal: 20, gap: 16 },
  shopCard: { backgroundColor: '#FFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  shopBanner: { height: 140, justifyContent: 'flex-end', padding: 12 },
  shopBannerOverlay: { ...StyleSheet.absoluteFillObject, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  shopRating: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4, backdropFilter: 'blur(4px)' },
  shopRatingText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  shopInfo: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  shopLogo: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#FFF', marginTop: -32, backgroundColor: '#FFF' },
  shopTextWrap: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  shopDesc: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
});