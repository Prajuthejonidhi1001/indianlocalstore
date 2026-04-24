import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { shopAPI, productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ShopProductsScreen({ route, navigation }) {
  const { shopId, shopName } = route.params;
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      // Parallel fetch — backend resolves shop->seller->products via ?shop=id
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.shopInfo}>
          <Text style={styles.shopTitle} numberOfLines={1}>{shop.name}</Text>
          <Text style={styles.shopSubtitle}>{shop.category_name} · {shop.distance_km || '1.2'} km</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={20} color={COLORS.primary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: shop.banner_image || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80' }} 
          style={styles.banner} 
        />
        
        <View style={styles.detailsCard}>
          <View style={styles.ratingRow}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color={COLORS.secondary} />
              <Text style={styles.badgeText}>{shop.rating || '4.5'}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="cube" size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>{products.length} Products</Text>
            </View>
            <TouchableOpacity style={styles.badge}>
              <Ionicons name="location" size={14} color={COLORS.textMuted} />
              <Text style={styles.badgeText}>Map</Text>
            </TouchableOpacity>
          </View>
          {/* Shop unique ID */}
          <View style={styles.shopIdRow}>
            <Ionicons name="barcode-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.shopIdText}>Shop ID: #{shop.id} · {String(shop.shop_code || '').slice(0, 8).toUpperCase()}</Text>
          </View>
          <Text style={styles.description}>{shop.description || 'Welcome to our shop! We provide the best quality products for our local community.'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="map-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.addressText}>{shop.address || 'Local Market Area'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Catalog</Text>
          {products.length > 0 ? (
            products.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                activeOpacity={0.85}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' }}
                    style={styles.productImage}
                  />
                </TouchableOpacity>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category_name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <View style={styles.productActions}>
                      <TouchableOpacity
                        style={styles.detailBtn}
                        onPress={() => navigation.navigate('ProductDetail', { product: item })}
                      >
                        <Text style={styles.detailBtnText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item.id)}>
                        <Ionicons name="cart-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No products listed yet.</Text>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  shopInfo: { flex: 1, marginLeft: 10 },
  shopTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  shopSubtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  actionBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.red, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.background },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  banner: { width: '100%', height: 200 },
  detailsCard: { 
    backgroundColor: COLORS.card, 
    margin: 20, 
    marginTop: -30, 
    borderRadius: 20, 
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10
  },
  ratingRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,107,53,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,107,53,0.1)' },
  badgeText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  description: { color: COLORS.text, fontSize: 14, lineHeight: 22, marginBottom: 15 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressText: { color: COLORS.textMuted, fontSize: 13 },

  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  productCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.card, 
    borderRadius: 18, 
    padding: 12, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  productImage: { width: 90, height: 90, borderRadius: 12 },
  productDetails: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  productName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  productCategory: { color: COLORS.textMuted, fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  addBtn: { backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  detailBtn: { backgroundColor: 'rgba(255,107,53,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,107,53,0.3)' },
  detailBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  shopIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 8 },
  shopIdText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', fontFamily: 'monospace' },
  
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 30 },
  errorText: { color: COLORS.text, fontSize: 18, marginBottom: 20 },
  backBtnLarge: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: '700' }
});
