import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Modal, Animated, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COLORS, SHADOWS, RADIUS } from '../constants';

export default function WishlistScreen({ navigation }) {
  const { user, toggleWishlist, getWishlist } = useAuth();
  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wishlist on mount and when user changes
  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const items = await getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addToCart(item.product, 1, {});
      await toggleWishlist(item.product); // Remove from wishlist after adding to cart
      setWishlistItems(prev => prev.filter(item => item.product !== item.product));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      await addToCart(item.product, 1, {});
      await toggleWishlist(item.product); // Remove from wishlist
      setWishlistItems(prev => prev.filter(item => item.product !== item.product));
    } catch (error) {
      console.error('Failed to move to cart:', error);
      Alert.alert('Error', 'Failed to move item to cart');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save items you love so you don't lose sight of them
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{ flex: 1 }} />
        <Text style={{
          color: COLORS.textMuted,
          fontSize: 14
        }}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </Text>
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.wishlistCard}>
            {/* Remove Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleRemoveFromWishlist(item.product)}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Product Image */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <Image
                source={{
                  uri: item.product_image?.startsWith('http')
                    ? item.product_image
                    : `${item.product_image.startsWith('/') ? '' : '/'}${item.product_image}`
                }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              >
                <Text style={styles.productTitle}>{item.product_name}</Text>
              </TouchableOpacity>

              <View style={styles.priceRow}>
                <Text style={styles.priceCurrent}>
                  ₹{(item.product_discount_price || item.product_price).toFixed(2)}
                </Text>
                {item.product_discount_price && (
                  <Text style={styles.priceOriginal}>
                    ₹{item.product_price.toFixed(2)}
                  </Text>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleAddToCart(item)}
                  style={styles.btnOutline}
                >
                  <Ionicons name="cart-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.btnText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleMoveToCart(item)}
                  style={styles.btnPrimary}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                  <Text style={styles.btnText}>Move to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 12,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 240,
  },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
  },

  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  wishlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginVertical: 8,
    ...SHADOWS.sm,
  },

  removeBtn: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    marginRight: 16,
  },

  productInfo: {
    flex: 1,
  },

  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  priceCurrent: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  priceOriginal: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
  },

  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
  },

  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 72,
  },
});