import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { productAPI } from '../utils/api';

const { width } = Dimensions.get('window');

const CAT_COLORS = [
  ['#FF6B35','#FF8C42'],
  ['#5521FF','#7C3AED'],
  ['#00C896','#00A878'],
  ['#FFB627','#FF9500'],
  ['#E91E8C','#C2185B'],
  ['#00B4D8','#0077B6'],
];

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getCategories();
      const cats = res.data.results || res.data;
      setCategories(cats);
      if (cats.length > 0) setActiveId(cats[0].id);
    } catch (e) {
      console.error('Fetch categories error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCategory = categories.find(c => c.id === activeId);

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <Text style={styles.heroLabel}>🛍️ Browse All</Text>
          <Text style={styles.heroTitle}>Shop by Category</Text>
          
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories or subcategories..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </View>

      {/* Main Body */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No results for "{search}"</Text>
        </View>
      ) : (
        <View style={styles.splitView}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
              {filtered.map((cat, i) => {
                const isActive = activeId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.sidebarPill, isActive && styles.sidebarPillActive]}
                    onPress={() => setActiveId(cat.id)}
                  >
                    <View style={styles.pillIconWrap}>
                      {cat.icon ? (
                        <Image source={{ uri: cat.icon }} style={styles.pillIcon} />
                      ) : (
                        <LinearGradient colors={CAT_COLORS[i % CAT_COLORS.length]} style={styles.pillDot} />
                      )}
                    </View>
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]} numberOfLines={2}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Right Content */}
          <View style={styles.content}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScroll}>
              {activeCategory && (
                <View style={styles.activeSection}>
                  <View style={styles.activeHeader}>
                    <Text style={styles.activeTitle}>{activeCategory.name}</Text>
                    {activeCategory.description && <Text style={styles.activeDesc}>{activeCategory.description}</Text>}
                  </View>

                  {activeCategory.subcategories?.length > 0 ? (
                    <View style={styles.subGrid}>
                      {activeCategory.subcategories.map((sub, j) => (
                        <TouchableOpacity
                          key={sub.id}
                          style={styles.subCard}
                          onPress={() => navigation.navigate('Subcategory', { subcategory: sub, sectorName: activeCategory.name })}
                        >
                          <View style={styles.subIconWrap}>
                            {sub.icon ? (
                              <Image source={{ uri: sub.icon }} style={styles.subImg} />
                            ) : (
                              <Text style={styles.subEmoji}>🏪</Text>
                            )}
                          </View>
                          <Text style={styles.subName} numberOfLines={2}>{sub.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.viewAllBtn}
                      onPress={() => navigation.navigate('Subcategory', { category: activeCategory, sectorName: activeCategory.name })}
                    >
                      <Text style={styles.viewAllText}>Browse {activeCategory.name} Shops</Text>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  
  hero: { backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heroLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5, marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 16 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: RADIUS.lg, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.text },

  loader: { flex: 1, justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted },

  splitView: { flex: 1, flexDirection: 'row' },
  
  sidebar: { width: 100, backgroundColor: '#F8FAFC', borderRightWidth: 1, borderRightColor: COLORS.border },
  sidebarContent: { paddingVertical: 10 },
  sidebarPill: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  sidebarPillActive: { backgroundColor: '#FFF', borderLeftColor: COLORS.primary },
  pillIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...SHADOWS.sm, overflow: 'hidden' },
  pillIcon: { width: '100%', height: '100%' },
  pillDot: { width: '100%', height: '100%' },
  pillText: { fontSize: 11, textAlign: 'center', color: COLORS.textMuted, fontWeight: '600' },
  pillTextActive: { color: COLORS.primary, fontWeight: '800' },

  content: { flex: 1, backgroundColor: '#FFF' },
  contentScroll: { padding: 16 },
  activeHeader: { marginBottom: 20 },
  activeTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  activeDesc: { fontSize: 12, color: COLORS.textMuted },

  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  subCard: { width: '47%', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: RADIUS.md, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  subIconWrap: { width: 48, height: 48, borderRadius: RADIUS.sm, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...SHADOWS.sm, overflow: 'hidden' },
  subImg: { width: '100%', height: '100%' },
  subEmoji: { fontSize: 20 },
  subName: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  viewAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,107,53,0.1)', padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)' },
  viewAllText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
