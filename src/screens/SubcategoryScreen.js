import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { shopAPI } from '../utils/api';

const { width } = Dimensions.get('window');

export default function SubcategoryScreen({ route, navigation }) {
  const { subcategory, sectorName } = route.params;
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, [subcategory]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await shopAPI.getNearbyShops({ subcategory: subcategory.name });
      setShops(res.data.results || res.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

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
             <Ionicons name="location" size={12} color={COLORS.textMuted} /> {shop.city || 'Local Area'}
          </Text>
        </View>
        <View style={styles.shopRating}>
          <Ionicons name="star" size={13} color={COLORS.secondary} />
          <Text style={styles.ratingValue}>{shop.rating?.toFixed(1) || '4.5'}</Text>
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
          {shop.verification_status?.toUpperCase() || 'REGISTERED'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerLabel}>{sectorName.toUpperCase()}</Text>
          <Text style={styles.title}>{subcategory.name}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.shopsList}>
            {shops.length > 0 ? (
              shops.map(renderShopCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="storefront-outline" size={60} color={COLORS.elevated} />
                <Text style={styles.emptyTitle}>No shops here yet</Text>
                <Text style={styles.emptySub}>We're expanding quickly. Check back soon!</Text>
              </View>
            )}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  headerInfo: { marginLeft: 15 },
  headerLabel: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },

  loader: { flex: 1, justifyContent: 'center' },

  scroll: { paddingTop: 10 },
  shopsList: { paddingHorizontal: 25 },
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

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 15, marginBottom: 5 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
