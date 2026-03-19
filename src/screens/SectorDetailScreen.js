import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SectorDetailScreen({ route, navigation }) {
  const { sector } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Image source={{ uri: sector.image }} style={styles.headerImage} />
        <View style={[styles.headerOverlay, { backgroundColor: sector.color + 'EE' }]} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{sector.name}</Text>
          <Text style={styles.headerDesc}>{sector.description}</Text>
          <View style={styles.countBadge}><Text style={styles.countText}>{sector.subcategories.length} Sub-sectors</Text></View>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.sectionTitle}>Choose a Sub-sector</Text>
        <View style={styles.grid}>
          {sector.subcategories.map((sub) => (
            <TouchableOpacity key={sub.name} style={styles.subCard} activeOpacity={0.85} onPress={() => navigation.navigate('Subcategory', { subsector: sub, sector: sector.name })}>
              <Image source={{ uri: sub.image }} style={styles.subImage} />
              <View style={styles.subOverlay} />
              <View style={styles.subContent}>
                <Text style={styles.subName}>{sub.name}</Text>
                <View style={styles.subArrow}><Ionicons name="arrow-forward" size={14} color="#fff" /></View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerWrap: { height: 220, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', top: 48, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  headerContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  countBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  countText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  list: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  subCard: { width: CARD_WIDTH, height: 130, borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  subImage: { width: '100%', height: '100%', position: 'absolute' },
  subOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  subContent: { flex: 1, justifyContent: 'flex-end', padding: 12, flexDirection: 'row', alignItems: 'flex-end' },
  subName: { flex: 1, fontSize: 14, fontWeight: '800', color: '#fff', lineHeight: 18 },
  subArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
});
