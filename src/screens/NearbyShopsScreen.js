import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const MOCK_SHOPS = [
  { id: 1, name: 'Raghavendra Tailors', category: 'FASHION', location: 'Chikkamagaluru, 577102', rating: 4.5, products: 12, distance: '1.2 km' },
  { id: 2, name: 'Green Valley Traders', category: 'TRADERS', location: 'Bengaluru, 560001', rating: 4.8, products: 45, distance: '2.0 km' },
  { id: 3, name: 'City Motors', category: 'AUTOMOBILE', location: 'Bengaluru, 560001', rating: 4.3, products: 8, distance: '3.5 km' },
  { id: 4, name: 'Modi Electronics', category: 'ELECTRONICS', location: 'Bengaluru, 560001', rating: 4.6, products: 32, distance: '1.8 km' },
  { id: 5, name: 'Sharma Furniture House', category: 'FURNITURES', location: 'Mysuru, 570001', rating: 4.4, products: 20, distance: '4.1 km' },
  { id: 6, name: 'Patel Supermart', category: 'MART', location: 'Bengaluru, 560002', rating: 4.7, products: 200, distance: '0.8 km' },
];

export default function NearbyShopsScreen() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_SHOPS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <TextInput placeholder="Search shops..." value={search} onChangeText={setSearch} style={styles.searchInput} placeholderTextColor={COLORS.textMuted} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.heading}>Shops Near You</Text>
        {filtered.map((shop) => (
          <View key={shop.id} style={styles.shopCard}>
            <View style={styles.shopAvatarWrap}><Text style={styles.shopAvatarText}>{shop.name[0]}</Text></View>
            <View style={styles.shopInfo}>
              <View style={styles.row}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={10} color={COLORS.primary} />
                  <Text style={styles.distanceText}> {shop.distance}</Text>
                </View>
              </View>
              <Text style={styles.shopCat}>{shop.category}</Text>
              <View style={styles.row2}>
                <Ionicons name="location-outline" size={12} color={COLORS.gray} />
                <Text style={styles.shopLoc}> {shop.location}</Text>
              </View>
              <View style={styles.row2}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.rating}> {shop.rating}</Text>
                <Text style={styles.productCount}> · {shop.products} products</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.dark, marginLeft: 8 },
  list: { paddingHorizontal: 16 },
  heading: { fontSize: 20, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  shopCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  shopAvatarWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  shopAvatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  shopInfo: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  row2: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  shopName: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  distanceText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  shopCat: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 1, marginBottom: 4 },
  shopLoc: { fontSize: 12, color: COLORS.gray },
  rating: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  productCount: { fontSize: 12, color: COLORS.gray },
});
