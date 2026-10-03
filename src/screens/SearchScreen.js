import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';
import { productAPI } from '../utils/api';

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState('-created_at');

  useEffect(() => {
    productAPI.getCategories()
      .then(res => setCategories(res.data.results || res.data))
      .catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory,
        min_price: minPrice,
        max_price: maxPrice,
        min_rating: minRating,
        ordering: sortBy
      };
      // Clean up params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const res = await productAPI.getProducts(params);
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice, minRating, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
    setSortBy('-created_at');
    setFilterModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header / Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.listRow}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              style={[styles.productCard, { width: '48%' }]}
            >
              <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₹{typeof item.price === 'object' && item.price !== null ? (item.price.price || item.price.Size || 0) : item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={64} color={COLORS.borderStrong} />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyDesc}>Try adjusting your search or filters.</Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {/* Sort */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.chipRow}>
              {[
                { label: 'Newest', value: '-created_at' },
                { label: 'Price: Low to High', value: 'price' },
                { label: 'Price: High to Low', value: '-price' },
                { label: 'Top Rated', value: '-rating' }
              ].map(opt => (
                <TouchableOpacity 
                  key={opt.value} 
                  style={[styles.chip, sortBy === opt.value && styles.chipActive]}
                  onPress={() => setSortBy(opt.value)}
                >
                  <Text style={[styles.chipText, sortBy === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={styles.sectionTitle}>Category</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{ gap: 10, paddingBottom: SPACING.md }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.chip, selectedCategory === item.id && styles.chipActive]}
                  onPress={() => setSelectedCategory(item.id === selectedCategory ? null : item.id)}
                >
                  <Text style={[styles.chipText, selectedCategory === item.id && styles.chipTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            {/* Price */}
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min ₹"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text style={{ color: COLORS.textMuted }}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max ₹"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 16,
  },
  filterButton: {
    padding: SPACING.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  listRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 14,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.text,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  clearBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
  },
  clearBtnText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  listRow: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  productDetails: {
    padding: SPACING.sm,
  },
  productName: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    ...TYPOGRAPHY.h6,
    color: COLORS.primary,
  }
});

