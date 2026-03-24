import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  Dimensions,
  ActivityIndicator,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { shopAPI, productAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛',
  'Spices': '🌿', 'Grains': '🌾', 'Snacks': '🥜',
  'Meat': '🍖', 'Beverages': '🧃', 'Bakery': '🍞',
  'Personal Care': '🧴', 'Home & Living': '🏠', 'Electronics': '📱',
  'Clothing': '👕', 'Stationery': '📚', 'Pharmacy': '💊',
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { location, setLocation } = useLocation();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { cartCount } = useCart();

  useEffect(() => {
    fetchInitialData();
  }, [location?.district]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [catRes, shopRes] = await Promise.all([
        productAPI.getCategories(),
        shopAPI.getNearbyShops({ city: location?.district })
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
      if (status !== 'granted') return alert('Permission to access location was denied');
      let loc = await Location.getCurrentPositionAsync({});
      // Reverse geocoding can be added here
      setLocation({
        name: 'Nearby Me',
        district: 'Current Location',
        coords: { lat: loc.coords.latitude, lng: loc.coords.longitude }
      });
    } finally { setLocating(false); }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.catPill, 
        selectedCategory === item.id && styles.catPillActive
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text style={[styles.catText, selectedCategory === item.id && styles.catTextActive]}>
        {CAT_EMOJIS[item.name] || '🛍️'} {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderShopCard = (shop) => (
    <TouchableOpacity 
      key={shop.id} 
      style={styles.shopCard}
      onPress={() => navigation.navigate('ShopProducts', { shopId: shop.id, shopName: shop.name })}
    >
      <View style={styles.shopHeader}>
        <View style={styles.shopAvatar}>
          <Text style={styles.avatarText}>{shop.name[0]}</Text>
        </View>
        <View style={styles.shopBasicInfo}>
          <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
          <Text style={styles.shopCity}>
            <Ionicons name="location" size={12} color={COLORS.textMuted} /> {shop.city || 'Local'}
          </Text>
        </View>
        <View style={styles.shopRating}>
          <Ionicons name="star" size={13} color={COLORS.secondary} />
          <Text style={styles.ratingValue}>{shop.rating?.toFixed(1) || '0.0'}</Text>
        </View>
      </View>
      
      {shop.description && (
        <Text style={styles.shopDesc} numberOfLines={2}>{shop.description}</Text>
      )}
      
      <View style={[styles.statusBadge, { 
        backgroundColor: shop.verification_status === 'verified' ? 'rgba(46,204,113,0.1)' : 'rgba(255,107,53,0.1)' 
      }]}>
        <Text style={[styles.statusText, { 
          color: shop.verification_status === 'verified' ? COLORS.green : COLORS.primary 
        }]}>
          {shop.verification_status?.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredShops = selectedCategory
    ? shops.filter(s => s.category === selectedCategory || (s.categories && s.categories.includes(selectedCategory)))
    : shops;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Banner (Mirroring Web) */}
        <View style={styles.banner}>
          <TouchableOpacity 
            style={styles.cartHeaderBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart" size={24} color={COLORS.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadgeHeader}>
                <Text style={styles.cartBadgeHeaderText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.bannerContent}>
            <Text style={styles.greeting}>
              Namaste, <Text style={styles.greetingBold}>{user?.first_name || user?.username || 'Guest'}!</Text> 🙏
            </Text>
            <Text style={styles.subGreeting}>
              {location ? `Discover local shops near ${location.name}` : 'Discover local shops near you'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.gpsBtn} 
            onPress={triggerGPS}
            disabled={locating}
          >
            {locating ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="navigate" size={18} color="#fff" />}
            <Text style={styles.gpsBtnText}>{locating ? 'Finding...' : 'Use My Location'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Top Location Selection Bar */}
          <View style={styles.locationBar}>
             <TouchableOpacity 
              style={styles.locationSelector}
              onPress={() => navigation.navigate('LocationPicker')}
            >
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.currentLocText} numberOfLines={1}>
                {location ? location.name : 'Select Your Area'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Categories Horizontal */}
          <View style={styles.sectionHead}>
            <View style={styles.labelRow}>
              <Ionicons name="bag-handle" size={14} color={COLORS.primary} />
              <Text style={styles.sectionLabel}>CATEGORIES</Text>
            </View>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catList}
          />

          {/* Nearby Shops */}
          <View style={styles.sectionHead}>
            <View style={styles.labelRow}>
              <Ionicons name="pin" size={14} color={COLORS.primary} />
              <Text style={styles.sectionLabel}>SHOPS</Text>
            </View>
            <Text style={styles.sectionTitle}>
              {location ? `Local Shops near ${location.name}` : 'Local Shops'}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : (
            <View style={styles.shopsList}>
              {filteredShops.length > 0 ? (
                filteredShops.map(renderShopCard)
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🏪</Text>
                  <Text style={styles.emptyTitle}>No shops registered yet</Text>
                  <Text style={styles.emptySub}>Be the first seller in your area!</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // Banner (Web Style)
  banner: { 
    paddingTop: 70, 
    paddingBottom: 40, 
    paddingHorizontal: 25, 
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  greeting: { fontSize: 28, color: COLORS.text, fontWeight: '400' },
  greetingBold: { fontWeight: '900', color: COLORS.primary },
  subGreeting: { color: COLORS.textMuted, fontSize: 16, marginTop: 8, marginBottom: 25 },
  gpsBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.primary, 
    paddingVertical: 14, 
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.brand
  },
  gpsBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  cartHeaderBtn: { position: 'absolute', top: 60, right: 25, zIndex: 10, backgroundColor: COLORS.card, padding: 10, borderRadius: RADIUS.full, ...SHADOWS.md },
  cartBadgeHeader: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.red, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.background },
  cartBadgeHeaderText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  mainContent: { paddingBottom: 20 },

  // Location Bar
  locationBar: { paddingHorizontal: 25, marginTop: -22 },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md
  },
  currentLocText: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1, marginHorizontal: 10 },

  // Section Headers
  sectionHead: { paddingHorizontal: 25, marginTop: 35, marginBottom: 15 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sectionLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },

  // Categories
  catList: { paddingLeft: 25, paddingRight: 10 },
  catPill: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: RADIUS.full, 
    backgroundColor: 'transparent', 
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  catTextActive: { color: '#fff' },

  // Shop Cards (Exact Web Hierarchy)
  shopsList: { paddingHorizontal: 25, gap: 15 },
  shopCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.lg, 
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12 },
  shopAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: COLORS.elevated, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  avatarText: { color: COLORS.primary, fontSize: 20, fontWeight: '800' },
  shopBasicInfo: { flex: 1 },
  shopName: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  shopCity: { fontSize: 13, color: COLORS.textMuted, flexDirection: 'row', alignItems: 'center' },
  shopRating: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(255,182,39,0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: RADIUS.sm 
  },
  ratingValue: { color: COLORS.secondary, fontSize: 13, fontWeight: '700' },
  
  shopDesc: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 15 },
  
  statusBadge: { 
    alignSelf: 'flex-start',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: RADIUS.sm 
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  loader: { marginTop: 40 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 15, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMuted, marginBottom: 5 },
  emptySub: { fontSize: 14, color: COLORS.textDim, textAlign: 'center' },
});
