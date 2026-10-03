import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, FlatList, Animated, StatusBar,
  SafeAreaView, ImageBackground, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { productAPI, shopAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import config from '../config';

const { width } = Dimensions.get('window');

const CAT_EMOJIS = {
  'Vegetables': '\u{1F966}', 'Fruits': '\u{1F34E}', 'Dairy': '\u{1F95B}', 'Spices': '\u{1F336}',
  'Grains': '\u{1F33E}', 'Snacks': '\u{1F37F}', 'Meat': '\u{1F969}', 'Beverages': '\u{1F964}',
  'Bakery': '\u{1F35E}', 'Personal Care': '\u{1F6C0}', 'Home & Living': '\u{1F6CF}',
  'Electronics': '\u{1F4F1}', 'Clothing': '\u{1F455}', 'Pharmacy': '\u{1F48A}',
  'Fashion': '\u{1F460}', 'Agriculture': '\u{1F69C}', 'Automobile': '\u{1F697}',
  'Construction': '\u{1F3D7}', 'Furniture': '\u{1FA91}', 'Furnitures': '\u{1FA91}',
  'Mart': '\u{1F6D2}', 'Traders': '\u{1F4BC}', 'Event Management': '\u{1F389}',
  'Second Hand Vehicles': '\u{1F699}',
};

const HERO_BANNERS = [
  { 
    id: 1, 
    title: 'Mega Electronics Sale', 
    subtitle: 'Up to 40% Off on Top Brands', 
    colors: ['#0f2027', '#203a43'], 
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    title: 'Fresh Groceries Delivered', 
    subtitle: 'In 30 Minutes or Less', 
    colors: ['#11998e', '#38ef7d'], 
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    title: 'Premium Local Fashion', 
    subtitle: 'Trendy Styles at Unbeatable Prices', 
    colors: ['#8A2387', '#E94057'], 
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop' 
  }
];

const CAT_GRADIENTS = [
  ['#FF9A9E', '#FECFEF'],
  ['#a18cd1', '#fbc2eb'],
  ['#84fab0', '#8fd3f4'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
];

export default function HomeScreen({ navigation }) {
  const { user, location, triggerGPS } = useAuth();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Countdown timer for Flash Deals (5 hours)
  const [timeLeft, setTimeLeft] = useState(3600 * 5);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
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
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [location?.district]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };

  const renderBanner = ({ item }) => (
    <View style={styles.bannerSlide}>
      <LinearGradient colors={item.colors} style={styles.bannerGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
        <LinearGradient colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.2)', 'transparent']} style={styles.bannerOverlay} start={{x: 0, y: 0.5}} end={{x: 1, y: 0.5}} />
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
            <Text style={styles.welcomeText}>Hello, {user?.first_name || 'Guest'} ðŸ‘‹</Text>
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
              const hasIcon = cat.icon;
              const backendHost = config.API_BASE_URL.replace(/\/api\/?$/, '');
              let iconUrl = cat.icon;
              if (hasIcon && !iconUrl.startsWith('http')) {
                iconUrl = iconUrl.startsWith('/') ? `${backendHost}${iconUrl}` : `${backendHost}/media/${iconUrl}`;
              }
              return (
                <TouchableOpacity key={cat.id} style={styles.catWrap} onPress={() => navigation.navigate('ShopList', { categoryId: cat.id })}>
                  {hasIcon ? (
                    <View style={[styles.catCircle, { overflow: 'hidden', backgroundColor: '#F0F0F0' }]}>
                      <Image source={{ uri: iconUrl }} style={{ width: '100%', height: '100%' }} />
                    </View>
                  ) : (
                    <LinearGradient colors={gradient} style={styles.catCircle}>
                      <Text style={styles.catEmoji}>{CAT_EMOJIS[cat.name] || 'ðŸ›ï¸'}</Text>
                    </LinearGradient>
                  )}
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
              {trendingProducts.map(product => {
                  const prodPrice = typeof product.price === 'object' && product.price !== null ? product.price.price : product.price;
                  const hasDiscount = product.discount_price && parseFloat(product.discount_price) < parseFloat(prodPrice);
                  const discountPercent = hasDiscount ? Math.round((1 - (parseFloat(product.discount_price) / parseFloat(prodPrice))) * 100) : 0;
                  return (
                  <TouchableOpacity key={product.id} style={styles.flashCard} onPress={() => navigation.navigate('ProductDetail', { product: product })}>
                    <Image source={{ uri: product.image || 'https://via.placeholder.com/150' }} style={styles.flashImage} />
                    {hasDiscount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discountPercent}%</Text>
                      </View>
                    )}
                    <View style={styles.flashInfo}>
                      <Text style={styles.flashName} numberOfLines={2}>{product.name}</Text>
                      <View style={styles.flashPriceRow}>
                        <Text style={styles.flashPrice}>₹{hasDiscount ? product.discount_price : prodPrice}</Text>
                        {hasDiscount && <Text style={styles.flashOldPrice}>₹{prodPrice}</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                  );
                })}
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
              <TouchableOpacity key={shop.id} style={styles.shopCard} onPress={() => navigation.navigate('ShopProducts', { shopId: shop.id, shopName: shop.name })}>
                <ImageBackground 
                  source={{ uri: shop.banner || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop' }} 
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

        {/* Recommended For You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="trending-up" size={22} color="#3498db" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Recommended For You</Text>
            </View>
          </View>
          
          <View style={styles.recommendedGrid}>
            {trendingProducts.slice(0, 10).map((prod) => {
              const prodPrice = typeof prod.price === 'object' && prod.price !== null ? prod.price.price : prod.price;
              const hasDiscount = prod.discount_price && parseFloat(prod.discount_price) < parseFloat(prodPrice);
              const finalPrice = hasDiscount ? prod.discount_price : prodPrice;
              return (
                <TouchableOpacity key={prod.id} style={styles.recCard} onPress={() => navigation.navigate('ProductDetail', { product: prod })}>
                  <Image source={{ uri: prod.image || 'https://via.placeholder.com/300' }} style={styles.recImage} />
                  <View style={styles.recInfo}>
                    <Text style={styles.recName} numberOfLines={2}>{prod.name}</Text>
                    <View style={styles.recRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.recRatingText}>{prod.average_rating || '4.5'}</Text>
                    </View>
                    <View style={styles.recPriceRow}>
                      <Text style={styles.recPrice}>₹{finalPrice}</Text>
                      {hasDiscount && <Text style={styles.recOldPrice}>₹{prodPrice}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  bannerSlide: { width: width - 32, height: 200, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  bannerGradient: { flex: 1 },
  bannerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.7 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  bannerContent: { flex: 1, justifyContent: 'center', padding: 24, paddingRight: 60 },
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
  shopRating: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  shopRatingText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  shopInfo: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  shopLogo: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#FFF', marginTop: -32, backgroundColor: '#FFF' },
  shopTextWrap: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  shopDesc: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },

  recommendedGrid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  recImage: { width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#F0F0F0' },
  recInfo: { padding: 12 },
  recName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4, height: 36, lineHeight: 18 },
  recRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  recRatingText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  recPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recPrice: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  recOldPrice: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
});





