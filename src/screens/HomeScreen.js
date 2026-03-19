import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../constants';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}><Text style={styles.logoEmoji}>🛒</Text></View>
              <View style={styles.logoTextWrap}>
                <Text style={styles.logoText}>INDIAN</Text>
                <Text style={styles.logoSubText}>LOCAL STORE</Text>
              </View>
            </View>
          </View>
          <View style={styles.flagStrip}>
            <View style={[styles.strip, { backgroundColor: '#FF8C00' }]} />
            <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.strip, { backgroundColor: '#138808' }]} />
          </View>
          <View style={styles.heroBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Live Local Marketplace</Text>
          </View>
          <Text style={styles.heroTitle}>Your Trusted{'\n'}<Text style={styles.heroTitleAccent}>Neighborhood{'\n'}</Text>Marketplace.</Text>
          <Text style={styles.heroSubtitle}>Connect with local sellers. Buy fresh produce, clothes, and services near you.</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={18} color={COLORS.gray} />
              <TextInput placeholder="Search products, shops..." value={searchText} onChangeText={setSearchText} style={styles.searchText} placeholderTextColor={COLORS.textMuted} />
            </View>
            <TouchableOpacity style={styles.searchButton}><Text style={styles.searchButtonText}>Search</Text></TouchableOpacity>
          </View>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustCard}>
          <View style={styles.trustIcon}><Ionicons name="checkmark-circle" size={28} color={COLORS.success} /></View>
          <View style={styles.trustText}>
            <Text style={styles.trustTitle}>Trusted Local Sellers</Text>
            <Text style={styles.trustSub}>Verified local community businesses</Text>
          </View>
          <Text style={styles.flagEmoji}>🇮🇳</Text>
        </View>

        {/* Sectors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Sectors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => navigation.navigate('SectorDetail', { sector: cat })} activeOpacity={0.9}>
                <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                <View style={[styles.categoryOverlay, { backgroundColor: cat.color + 'CC' }]} />
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <View style={styles.subcategoryRow}>
                    {cat.subcategories.slice(0, 2).map((sub) => (
                      <View key={sub.name} style={styles.subcategoryTag}>
                        <Text style={styles.subcategoryText}>{sub.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Banner */}
        <View style={styles.supportBanner}>
          <Text style={styles.supportEmoji}>🇮🇳</Text>
          <View style={styles.supportTextWrap}>
            <Text style={styles.supportTitle}>Support Local Vyapaar</Text>
            <Text style={styles.supportSub}>Empowering Indian small businesses</Text>
          </View>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoEmoji: { fontSize: 20 },
  logoTextWrap: {},
  logoText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  logoSubText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 3 },
  flagStrip: { flexDirection: 'row', height: 3, borderRadius: 2, marginBottom: 20, overflow: 'hidden' },
  strip: { flex: 1 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', lineHeight: 40, marginBottom: 10 },
  heroTitleAccent: { color: '#FFD700' },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 20 },
  searchContainer: { flexDirection: 'row' },
  searchInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginRight: 10 },
  searchText: { flex: 1, fontSize: 14, color: COLORS.dark, marginLeft: 8 },
  searchButton: { backgroundColor: '#FFD700', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, justifyContent: 'center' },
  searchButtonText: { color: COLORS.dark, fontWeight: '800', fontSize: 14 },
  trustCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, marginBottom: 8, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  trustIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  trustText: { flex: 1 },
  trustTitle: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  trustSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  flagEmoji: { fontSize: 28 },
  section: { paddingTop: 20, paddingLeft: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.dark, marginBottom: 14, paddingRight: 16 },
  categoryScroll: { paddingRight: 16 },
  categoryCard: { width: 200, height: 220, borderRadius: 20, overflow: 'hidden', marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  categoryImage: { width: '100%', height: '100%', position: 'absolute' },
  categoryOverlay: { ...StyleSheet.absoluteFillObject },
  categoryContent: { flex: 1, justifyContent: 'flex-end', padding: 14 },
  categoryName: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subcategoryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  subcategoryTag: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginRight: 5, marginBottom: 4 },
  subcategoryText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  supportBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: COLORS.dark, borderRadius: 20, padding: 20 },
  supportEmoji: { fontSize: 36, marginRight: 14 },
  supportTextWrap: {},
  supportTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  supportSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
});
