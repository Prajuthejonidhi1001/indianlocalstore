import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Product 1', price: '₹500', description: 'Quality product available here', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400' },
  { id: 2, name: 'Product 2', price: '₹750', description: 'Best in class product', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400' },
  { id: 3, name: 'Product 3', price: '₹1200', description: 'Premium quality guaranteed', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400' },
];

export default function ShopProductsScreen({ route, navigation }) {
  const { shop, subsector, sector } = route.params;
  const products = DEFAULT_PRODUCTS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.shopAvatar}><Text style={styles.shopAvatarText}>{shop.name[0]}</Text></View>
        <View style={styles.shopMeta}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopCategory}>{subsector} · {sector}</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={12} color={COLORS.gray} />
            <Text style={styles.shopLoc}> {shop.location}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.mapBtn}><Ionicons name="navigate" size={20} color={COLORS.primary} /></TouchableOpacity>
      </View>

      <View style={styles.ratingBar}>
        <View style={styles.ratingItem}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}> {shop.rating || 4.5} Rating</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.ratingItem}>
          <Ionicons name="cube-outline" size={16} color={COLORS.primary} />
          <Text style={styles.ratingText}> {products.length} Products</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.ratingItem}>
          <Ionicons name="call-outline" size={16} color={COLORS.success} />
          <Text style={styles.ratingText}> Contact</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.sectionTitle}>Products</Text>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDesc}>{product.description}</Text>
              <View style={styles.productBottom}>
                <Text style={styles.productPrice}>{product.price}</Text>
                <TouchableOpacity style={styles.contactBtn}>
                  <Ionicons name="call-outline" size={14} color="#fff" />
                  <Text style={styles.contactBtnText}> Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.navigateBtn}>
          <Ionicons name="location" size={20} color="#fff" />
          <Text style={styles.navigateBtnText}> Navigate to Shop</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  shopAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  shopAvatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  shopMeta: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  shopCategory: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  shopLoc: { fontSize: 11, color: COLORS.gray },
  mapBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  ratingBar: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  ratingItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  divider: { width: 1, backgroundColor: COLORS.border },
  list: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 16, marginTop: 4 },
  productCard: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  productImage: { width: 110, height: 110 },
  productInfo: { flex: 1, padding: 14, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  productDesc: { fontSize: 12, color: COLORS.gray, lineHeight: 18, flex: 1 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  productPrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  contactBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  navigateBtn: { backgroundColor: COLORS.dark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  navigateBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
