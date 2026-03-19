import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../constants';

export default function CategoriesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>All Sectors</Text>
        <View style={styles.list}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('SectorDetail', { sector: cat })}>
              <Image source={{ uri: cat.image }} style={styles.image} />
              <View style={[styles.overlay, { backgroundColor: cat.color + 'DD' }]} />
              <View style={styles.content}>
                <View style={styles.numberBadge}><Text style={styles.numberText}>{cat.id}</Text></View>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catDesc}>{cat.description}</Text>
                <View style={styles.tags}>
                  {cat.subcategories.slice(0, 3).map((sub) => (
                    <View key={sub.name} style={styles.tag}><Text style={styles.tagText}>{sub.name}</Text></View>
                  ))}
                  {cat.subcategories.length > 3 && <View style={styles.tag}><Text style={styles.tagText}>+{cat.subcategories.length - 3} more</Text></View>}
                </View>
              </View>
              <View style={styles.arrow}><Ionicons name="chevron-forward" size={20} color="#fff" /></View>
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
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.dark, margin: 20, marginBottom: 16 },
  list: { paddingHorizontal: 16 },
  card: { height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, justifyContent: 'flex-end', padding: 16, paddingRight: 48 },
  numberBadge: { position: 'absolute', top: 16, left: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  numberText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  catName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  catDesc: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginRight: 5, marginBottom: 4 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '500' },
  arrow: { position: 'absolute', right: 16, bottom: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
});
