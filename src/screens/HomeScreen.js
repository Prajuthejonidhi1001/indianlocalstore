import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, Dimensions, ActivityIndicator,
  FlatList, Platform, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { shopAPI, productAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛',
  'Spices': '🌿', 'Grains': '🌾', 'Snacks': '🥜',
  'Meat': '🍖', 'Beverages': '🧃', 'Bakery': '🍞',
  'Personal Care': '🧴', 'Home & Living': '🏠', 'Electronics': '📱',
  'Clothing': '👕', 'Stationery': '📚', 'Pharmacy': '💊',
};

const CAT_COLORS = {
  'Vegetables': '#00E676', 'Fruits': '#FF1744', 'Dairy': '#2196F3',
  'Spices': '#FF6B35', 'Grains': '#F39C12', 'Snacks': '#FFB627',
  'Meat': '#E91E63', 'Beverages': '#00BCD4', 'Bakery': '#795548',
  'Personal Care': '#AB47BC', 'Home & Living': '#00ACC1',
  'Electronics': '#3F51B5', 'Clothing': '#FF7043', 'Stationery': '#4CAF50', 'Pharmacy': '#F44336',
};

// Animated shop card wrapper
function AnimatedShopCard({ shop, navigation, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  const catColor = CAT_COLORS[shop.category_name] || COLORS.primary;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.shopCard}
        onPress={() => navigation.navigate('ShopProducts', { shopId: shop.id, shopName: shop.name })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Glow strip at top */}
        <View style={[styles.shopCardAccent, { backgroundColor: catColor + '40' }]} />

        <View style={styles.shopHeader}>
          {/* Avatar with gradient ring */}
          <View style={styles.shopAvatarWrap}>
            {shop.logo ? (
              <Image source={{ uri: shop.logo }} style={styles.shopLogo} />
            ) : (
              <LinearGradient
                colors={[catColor + 'CC', catColor + '44']}
                style={styles.shopAvatar}
              >
                <Text style={styles.avatarText}>{shop.name[0].toUpperCase()}</Text>
              </LinearGradient>
            )}
            {shop.verification_status === 'verified' && (
              <View style={styles.verifiedDot}>
                <Ionicons name="checkmark" size={8} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.shopBasicInfo}>
            <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
            <View style={styles.shopMetaRow}>
              <Ionicons name="location" size={11} color={COLORS.textMuted} />
              <Text style={styles.shopCity}>{shop.city || 'Local'}</Text>
              {shop.distance && (
                <>
                  <Text style={styles.shopDot}>·</Text>
                  <Text style={styles.shopDist}>{shop.distance} km</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.shopRating}>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
            <Text style={styles.ratingValue}>{shop.rating?.toFixed(1) || '4.5'}</Text>
          </View>
        </View>

        {shop.description && (
          <Text style={styles.shopDesc} numberOfLines={1}>{shop.description}</Text>
        )}

        <View style={styles.shopFooter}>
          <View style={[styles.statusBadge, {
            backgroundColor: shop.verification_status === 'verified' ? 'rgba(0,230,118,0.1)' : 'rgba(255,107,53,0.1)',
            borderColor: shop.verification_status === 'verified' ? 'rgba(0,230,118,0.3)' : 'rgba(255,107,53,0.3)',
          }]}>
            <View style={[styles.statusDot, { backgroundColor: shop.verification_status === 'verified' ? '#00E676' : COLORS.primary }]} />
            <Text style={[styles.statusText, {
              color: shop.verification_status === 'verified' ? '#00E676' : COLORS.primary
            }]}>
              {shop.verification_status === 'verified' ? 'VERIFIED' : 'UNVERIFIED'}
            </Text>
          </View>
          <View style={styles.shopArrow}>
            <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated category pill
function AnimatedCatPill({ item, isActive, onPress, index }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const catColor = CAT_COLORS[item.name] || COLORS.primary;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.9, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.catPill, isActive && { backgroundColor: catColor + '25', borderColor: catColor }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.catEmoji]}>{CAT_EMOJIS[item.name] || '🛍️'}</Text>
        <Text style={[styles.catText, isActive && { color: catColor, fontWeight: '800' }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { location, setLocation } = useLocation();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { cartCount } = useCart();

  // Header animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.85], extrapolate: 'clamp' });
  const headerScale = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.96], extrapolate: 'clamp' });

  // Hero elements fade in
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
    fetchInitialData();
  }, [location?.district]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [catRes, shopRes] = await Promise.all([
        productAPI.getCategories(),
        shopAPI.getNearbyShops({ city: location?.district }),
      ]);
      setCategories(catRes.data.results || catRes.data);
      setShops(shopRes.data.results || shopRes.data);
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
      setLocation({
        name: 'Nearby Me',
        district: 'Current Location',
        coords: { lat: loc.coords.latitude, lng: loc.coords.longitude },
      });
    } finally { setLocating(false); }
  };

  const filteredShops = selectedCategory
    ? shops.filter(s => s.category === selectedCategory || (s.categories && s.categories.includes(selectedCategory)))
    : shops;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* ── HERO BANNER ── */}
        <LinearGradient
          colors={['#0D1117', '#131920', '#0F1520']}
          style={styles.banner}
        >
          {/* Decorative orb */}
          <View style={styles.heroOrb1} />
          <View style={styles.heroOrb2} />

          {/* Cart button */}
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={22} color={COLORS.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <Animated.View style={[styles.bannerContent, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
            <View style={styles.heroBadge}>
              <View style={styles.herobadgeDot} />
              <Text style={styles.heroBadgeText}>🇮🇳 India's Local Market</Text>
            </View>

            <Text style={styles.greeting}>
              {getGreeting()},
            </Text>
            <Text style={styles.greetingName}>
              {user?.first_name || user?.username || 'Guest'} 🙏
            </Text>
            <Text style={styles.subGreeting}>
              {location ? `Discover fresh products near ${location.name}` : 'Find the best local shops near you'}
            </Text>

            {/* Location + GPS row */}
            <View style={styles.locRow}>
              <TouchableOpacity
                style={styles.locationSelector}
                onPress={() => navigation.navigate('LocationPicker')}
              >
                <Ionicons name="location" size={14} color={COLORS.primary} />
                <Text style={styles.locText} numberOfLines={1}>
                  {location ? location.name : 'Select Area'}
                </Text>
                <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.gpsBtn} onPress={triggerGPS} disabled={locating}>
                {locating
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="navigate" size={15} color="#fff" />
                }
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchWrap}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={16} color={COLORS.textMuted} />
            <Text style={styles.searchPlaceholder}>Search products, shops...</Text>
            <View style={styles.searchFilter}>
              <Ionicons name="options" size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── QUICK STATS ── */}
        <View style={styles.statsRow}>
          {[
            { icon: '🏪', value: `${shops.length}+`, label: 'Local Shops' },
            { icon: '📦', value: '10K+', label: 'Products' },
            { icon: '⭐', value: '4.8', label: 'Avg Rating' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── CATEGORIES ── */}
        <View style={styles.sectionHead}>
          <View style={styles.labelRow}>
            <Ionicons name="bag-handle" size={12} color={COLORS.primary} />
            <Text style={styles.sectionLabel}>SHOP BY CATEGORY</Text>
          </View>
          <Text style={styles.sectionTitle}>Browse Products</Text>
        </View>

        <FlatList
          data={categories}
          renderItem={({ item, index }) => (
            <AnimatedCatPill
              item={item}
              index={index}
              isActive={selectedCategory === item.id}
              onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
            />
          )}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
        />

        {/* ── SHOPS ── */}
        <View style={styles.sectionHead}>
          <View style={styles.labelRow}>
            <Ionicons name="pin" size={12} color={COLORS.primary} />
            <Text style={styles.sectionLabel}>NEARBY SHOPS</Text>
          </View>
          <Text style={styles.sectionTitle}>
            {location ? `Near ${location.name}` : 'Local Shops'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Finding shops near you...</Text>
          </View>
        ) : (
          <View style={styles.shopsList}>
            {filteredShops.length > 0 ? (
              filteredShops.map((shop, i) => (
                <AnimatedShopCard key={shop.id} shop={shop} navigation={navigation} index={i} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={styles.emptyTitle}>No shops found</Text>
                <Text style={styles.emptySub}>Try a different area or be the first seller!</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Banner
  banner: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 30,
    paddingHorizontal: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute',
    width: 250, height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,107,53,0.08)',
    top: -80, right: -60,
  },
  heroOrb2: {
    position: 'absolute',
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,182,39,0.06)',
    bottom: -50, left: 20,
  },
  cartBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 48,
    right: 22,
    zIndex: 10,
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4, right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.background,
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  bannerContent: { paddingTop: 8 },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  herobadgeDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  heroBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  greeting: { fontSize: 16, color: COLORS.textMuted, fontWeight: '400' },
  greetingName: { fontSize: 30, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  subGreeting: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 20 },

  locRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  locationSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  locText: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  gpsBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.brand,
  },

  // Search
  searchWrap: { paddingHorizontal: 20, marginTop: -18, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOWS.md,
  },
  searchPlaceholder: { flex: 1, color: COLORS.textMuted, fontSize: 13 },
  searchFilter: {
    width: 28, height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,107,53,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },

  // Section headers
  sectionHead: { paddingHorizontal: 22, marginTop: 28, marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  sectionLabel: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text },

  // Categories
  catList: { paddingLeft: 22, paddingRight: 8, gap: 8 },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 4,
  },
  catEmoji: { fontSize: 15 },
  catText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },

  // Shop list
  shopsList: { paddingHorizontal: 20, gap: 12 },
  shopCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.md,
  },
  shopCardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },

  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  shopAvatarWrap: { position: 'relative' },
  shopAvatar: {
    width: 48, height: 48,
    borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  shopLogo: { width: 48, height: 48, borderRadius: 24 },
  verifiedDot: {
    position: 'absolute',
    bottom: -1, right: -1,
    width: 16, height: 16,
    borderRadius: 8,
    backgroundColor: '#00E676',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.card,
  },

  shopBasicInfo: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
  shopMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shopCity: { fontSize: 12, color: COLORS.textMuted },
  shopDot: { color: COLORS.textMuted, fontSize: 12 },
  shopDist: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,182,39,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  ratingValue: { color: COLORS.secondary, fontSize: 12, fontWeight: '800' },

  shopDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 10 },

  shopFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  shopArrow: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Loading
  loaderWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loaderText: { color: COLORS.textMuted, fontSize: 13 },

  // Empty
  emptyContainer: { alignItems: 'center', padding: 50, gap: 10 },
  emptyIcon: { fontSize: 54 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textMuted },
  emptySub: { fontSize: 13, color: COLORS.textDim, textAlign: 'center' },
});
