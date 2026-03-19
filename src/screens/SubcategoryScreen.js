import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const DEFAULT_SHOPS = [
  { id: 1, name: 'Sri Ram Store', location: 'Bengaluru, Karnataka', rating: 4.5, distance: '1.2 km', products: 12 },
  { id: 2, name: 'Lakshmi Traders', location: 'Mysuru, Karnataka', rating: 4.2, distance: '2.5 km', products: 8 },
  { id: 3, name: 'Ganesh Enterprises', location: 'Hassan, Karnataka', rating: 4.7, distance: '3.1 km', products: 20 },
];

export default function SubcategoryScreen({ route, navigation }) {
  const { subsector, sector } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Image source={{ uri: subsector.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subsector.name}</Text>
        <Text style={styles.headerSub}>{sector}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.sectionTitle}>{DEFAULT_SHOPS.length} Shops Available</Text>
        {DEFAULT_SHOPS.map((shop) => (
          <TouchableOpacity key={shop.id} style={styles.shopCard} onPress={() => navigation.navigate('ShopProducts', { shop, subsector: subsector.name, sector })} activeOpacity={0.85}>
            <View style={styles.shopAvatar}><Text style={styles.shopAvatarText}>{shop.name[0]}</Text></View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={13} color={COLORS.gray} />
                <Text style={styles.shopLoc}> {shop.location}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.rating}> {shop.rating}</Text>
                <Text style={styles.dot}> · </Text>
                <Text style={styles.productCount}>{shop.products} products</Text>
                <Text style={styles.dot}> · </Text>
                <Text style={styles.distance}>{shop.distance}</Text>
              </View>
            </View>
            <View style={styles.arrowWrap}><Ionicons name="chevron-forward" size={20} color={COLORS.primary} /></View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerWrap: { height: 200, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  backBtn: { position: 'absolute', top: 48, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { position: 'absolute', bottom: 36, left: 20, fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSub: { position: 'absolute', bottom: 16, left: 20, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  list: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  shopCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  shopAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  shopAvatarText: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  shopLoc: { fontSize: 12, color: COLORS.gray },
  rating: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  dot: { color: COLORS.gray, fontSize: 12 },
  productCount: { fontSize: 12, color: COLORS.gray },
  distance: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  arrowWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});
