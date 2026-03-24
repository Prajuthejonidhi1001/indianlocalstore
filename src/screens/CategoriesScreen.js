import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { productAPI } from '../utils/api';

const { width } = Dimensions.get('window');

const EMOJIS = ['🥬', '🍎', '🥛', '🌿', '🌾', '🥜', '🧴', '🏠', '🐟', '🍬', '🥦', '🫙'];

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});

  useEffect(() => {
    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getCategories();
      setCategories(res.data.results || res.data);
    } catch (e) {
      console.error('Fetch categories error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCat = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategory = (cat, index) => {
    const isExpanded = expandedCats[cat.id];

    return (
      <View key={cat.id} style={styles.catSection}>
        <TouchableOpacity 
          style={styles.catHeader} 
          activeOpacity={0.7} 
          onPress={() => toggleCat(cat.id)}
        >
          {cat.icon ? (
            <Image source={{ uri: cat.icon }} style={styles.catImg} />
          ) : (
            <View style={styles.catEmojiBox}>
              <Text style={styles.emojiText}>{EMOJIS[index % EMOJIS.length]}</Text>
            </View>
          )}
          
          <View style={styles.catTitleBox}>
            <Text style={styles.catName}>{cat.name}</Text>
            {cat.description && <Text style={styles.catDesc} numberOfLines={1}>{cat.description}</Text>}
          </View>
          
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={COLORS.textMuted} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.subcatBox}>
            {cat.subcategories?.length > 0 ? (
              <View style={styles.subcatGrid}>
                {cat.subcategories.map((sub, j) => (
                  <TouchableOpacity 
                    key={sub.id} 
                    style={styles.subcatCard}
                    onPress={() => navigation.navigate('Subcategory', { subcategory: sub, sectorName: cat.name })}
                  >
                    {sub.icon ? (
                      <Image source={{ uri: sub.icon }} style={styles.subImg} />
                    ) : (
                      <View style={styles.subEmojiBox}>
                        <Text style={styles.subEmojiText}>{EMOJIS[(index + j + 1) % EMOJIS.length]}</Text>
                      </View>
                    )}
                    <Text style={styles.subName} numberOfLines={2}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.subEmpty}>No subcategories available.</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={{ fontSize: 13 }}>🛍️</Text>
          <Text style={styles.headerLabel}>SHOP BY CATEGORY</Text>
        </View>
        <Text style={styles.title}>All Categories</Text>
        <Text style={styles.subtitle}>Choose a category to explore fresh local products</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No categories found</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.list}
        >
          {categories.map((cat, i) => renderCategory(cat, i))}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 25 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  headerLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 5 },
  subtitle: { fontSize: 13, color: COLORS.textMuted },

  list: { paddingHorizontal: 25 },
  
  catSection: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    overflow: 'hidden',
    ...SHADOWS.sm
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  catImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.elevated
  },
  catEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,107,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)'
  },
  emojiText: {
    fontSize: 22
  },
  catTitleBox: {
    flex: 1,
    marginLeft: 15,
  },
  catName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2
  },
  catDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  
  subcatBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  subcatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subcatCard: {
    width: (width - 50 - 32 - 12) / 2, // width - paddingHorizontal(25+25) - cardPadding(16+16) - gap(12) / 2
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 10
  },
  subImg: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm
  },
  subEmojiBox: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subEmojiText: {
    fontSize: 16
  },
  subName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  subEmpty: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: 'italic'
  },

  loader: { flex: 1, justifyContent: 'center' },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -50 },
  emptyStateIcon: { fontSize: 50, marginBottom: 15, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMuted },
});
