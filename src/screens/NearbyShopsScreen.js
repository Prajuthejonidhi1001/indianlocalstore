import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { shopAPI, productAPI } from '../utils/api';

const { width } = Dimensions.get('window');

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛',
  'Spices': '🌿', 'Grains': '🌾', 'Snacks': '🥜',
  'Meat': '🍖', 'Beverages': '🧃', 'Bakery': '🍞',
  'Personal Care': '🧴', 'Home & Living': '🏠', 'Electronics': '📱',
  'Clothing': '👕', 'Stationery': '📚', 'Pharmacy': '💊',
};

export default function NearbyShopsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const shopParams = {};
      if (selectedCategory) shopParams.category = selectedCategory;

      const [catRes, shopRes] = await Promise.all([
        productAPI.getCategories(),
        shopAPI.getNearbyShops(shopParams)
      ]);
      setCategories(catRes.data.results || catRes.data);
      setShops(shopRes.data.results || shopRes.data);
    } catch (error) {
      console.error('NearbyShops fetchData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderCategoryPill = ({ item }) => (
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

  const renderShopItem = (shop) => (
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
            <Ionicons name="location" size={12} color={COLORS.textMuted} /> {shop.city || 'Local Area'}
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

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="search" size={14} color={COLORS.primary} />
          <Text style={styles.headerLabel}>EXPLORE</Text>
        </View>
        <Text style={styles.title}>Shops Near You</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput 
            placeholder="Search by shop name..." 
            value={search} 
            onChangeText={setSearch} 
            style={styles.searchInput} 
            placeholderTextColor={COLORS.textDim} 
          />
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.filtersWrapper}>
        <FlatList
          data={categories}
          renderItem={renderCategoryPill}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          ListHeaderComponent={() => (
            <TouchableOpacity 
              style={[styles.catPill, !selectedCategory && styles.catPillActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>All</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.shopList}
        >
          {filteredShops.length > 0 ? (
            filteredShops.map(renderShopItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={60} color={COLORS.elevated} />
              <Text style={styles.emptyText}>No shops matching your search.</Text>
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  headerLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.md, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, marginLeft: 10 },
  
  filtersWrapper: { marginBottom: 15 },
  filterList: { paddingHorizontal: 25 },
  catPill: { 
    paddingHorizontal: 18, 
    paddingVertical: 9, 
    borderRadius: RADIUS.full, 
    backgroundColor: 'transparent', 
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  catTextActive: { color: '#fff' },

  shopList: { paddingHorizontal: 25, paddingTop: 10 },
  shopCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.lg, 
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12 },
  shopAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.elevated, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  avatarText: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  shopBasicInfo: { flex: 1 },
  shopName: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  shopCity: { fontSize: 13, color: COLORS.textMuted },
  shopRating: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(255,182,39,0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: RADIUS.sm 
  },
  ratingValue: { color: COLORS.secondary, fontSize: 12, fontWeight: '700' },
  
  shopDesc: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 15 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  loader: { flex: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textDim, fontSize: 16, marginTop: 15, textAlign: 'center' },
});
