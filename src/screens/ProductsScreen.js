import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../constants';

const ALL_PRODUCTS = [
  { id: 1, name: 'Kurta Stitching', shop: 'Raghavendra Tailors', category: 'Fashion', location: 'Chikkamagaluru', description: 'Custom kurta for men and women', image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=400', price: '₹250' },
  { id: 2, name: 'Honda Activa', shop: 'City Motors', category: 'Automobile', location: 'Mumbai', description: 'Well maintained 2020 model', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400', price: '₹65,000' },
  { id: 3, name: 'Fresh Vegetables', shop: 'Green Valley', category: 'Traders', location: 'Bengaluru', description: 'Farm fresh organic vegetables', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400', price: '₹50/kg' },
  { id: 4, name: 'Samsung TV', shop: 'Modi Electronics', category: 'Electronics', location: 'Bengaluru', description: 'Brand new Samsung 55" 4K TV', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400', price: '₹45,000' },
  { id: 5, name: 'Teak Wood Sofa', shop: 'Sharma Furniture', category: 'Furnitures', location: 'Mysuru', description: 'Handcrafted solid teak wood sofa', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', price: '₹32,000' },
  { id: 6, name: 'Organic Tomatoes', shop: 'Green Valley', category: 'Traders', location: 'Bengaluru', description: 'Fresh organically grown tomatoes', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=400', price: '₹40/kg' },
];

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...CATEGORIES.slice(0, 6).map(c => c.name.split(' ')[0])];
  const filtered = ALL_PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.shop.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category.includes(activeCategory);
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <TextInput placeholder="Search products..." value={search} onChangeText={setSearch} style={styles.searchInput} placeholderTextColor={COLORS.textMuted} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]} onPress={() => setActiveCategory(cat)}>
            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.heading}>{filtered.length} Products Found</Text>
        {filtered.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productShop}>🏪 {product.shop}</Text>
              <Text style={styles.productDesc}>{product.description}</Text>
              <View style={styles.productBottom}>
                <Text style={styles.productPrice}>{product.price}</Text>
                <View style={styles.locRow}>
                  <Ionicons name="location-outline" size={12} color={COLORS.gray} />
                  <Text style={styles.productLoc}> {product.location}</Text>
                </View>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.dark, marginLeft: 8 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16 },
  heading: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  productCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  productImage: { width: 110, height: 120 },
  productInfo: { flex: 1, padding: 14 },
  productName: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 3 },
  productShop: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  productDesc: { fontSize: 11, color: COLORS.gray, lineHeight: 16, marginBottom: 8 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  productLoc: { fontSize: 11, color: COLORS.gray },
});
