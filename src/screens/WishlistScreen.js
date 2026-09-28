import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wishlistAPI, cartAPI } from '../utils/api';
import COLORS from '../constants/COLORS';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.getWishlist();
      setWishlist(res.data.results || res.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await wishlistAPI.removeFromWishlist(id);
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) {
      Alert.alert("Out of Stock", "This item is currently out of stock.");
      return;
    }
    try {
      await cartAPI.addItem(product.id, 1);
      Alert.alert("Success", `${product.name} added to cart!`);
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (wishlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptySub}>Save items you love to view them later.</Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.exploreBtnText}>Explore Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const product = item.product;
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}>
          <Image 
            source={{ uri: product.image || 'https://via.placeholder.com/150' }} 
            style={styles.image} 
          />
          {product.discount_percentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount_percentage}%</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.seller}>By {product.seller_name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.discount_price || product.price}</Text>
            {product.discount_price && (
              <Text style={styles.oldPrice}>₹{product.price}</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.removeBtn} 
            onPress={() => handleRemove(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addBtn, product.stock <= 0 && styles.disabledBtn]} 
            onPress={() => handleAddToCart(product)}
            disabled={product.stock <= 0}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addBtnText}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList 
        data={wishlist}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  removeBtn: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    marginRight: 10,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: COLORS.textMuted,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  }
});
