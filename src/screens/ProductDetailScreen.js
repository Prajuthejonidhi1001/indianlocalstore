import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Modal, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { COLORS, SHADOWS, RADIUS } from '../constants';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const discount = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0;

  // Build images array — support multiple images or fallback to single
  const images = product.images?.length > 0
    ? product.images.map(i => i.image || i)
    : product.image
    ? [product.image]
    : [];

  const handleAddToCart = async () => {
    await addToCart(product.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Full-screen image modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: images[activeImage] }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {images.length > 0 ? (
          <View>
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
              <Image
                source={{ uri: images[activeImage] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.expandHint}>
                <Ionicons name="expand" size={16} color="#fff" />
                <Text style={styles.expandText}>Tap to enlarge</Text>
              </View>
            </TouchableOpacity>
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {images.map((img, i) => (
                  <TouchableOpacity key={i} onPress={() => setActiveImage(i)} style={[styles.thumbnail, activeImage === i && styles.thumbnailActive]}>
                    <Image source={{ uri: img }} style={styles.thumbnailImg} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.noImage}>
            <Text style={{ fontSize: 60 }}>🛒</Text>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.infoCard}>
          {/* Category + discount badge */}
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category_name || product.category || 'General'}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <Ionicons key={s} name="star" size={14} color={s <= Math.round(product.rating || 0) ? COLORS.secondary : COLORS.border} />
            ))}
            <Text style={styles.ratingText}>{parseFloat(product.rating || 0).toFixed(1)}</Text>
            {product.reviews_count > 0 && <Text style={styles.reviewCount}>({product.reviews_count} reviews)</Text>}
          </View>

          {/* Price */}
          <View style={styles.priceBlock}>
            <Text style={styles.priceMain}>₹{(discountPrice || price).toFixed(2)}</Text>
            {discountPrice && <Text style={styles.priceOriginal}>₹{price.toFixed(2)}</Text>}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {product.description ? (
            <>
              <Text style={styles.sectionTitle}>About this product</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          ) : null}

          {/* Details grid */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            {product.unit && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Unit</Text>
                <Text style={styles.detailValue}>{product.unit}</Text>
              </View>
            )}
            {product.stock !== undefined && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Stock</Text>
                <Text style={[styles.detailValue, { color: product.stock > 0 ? COLORS.green : COLORS.red }]}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </Text>
              </View>
            )}
            {product.seller_name && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Seller</Text>
                <Text style={styles.detailValue}>{product.seller_name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Add to Cart */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Total</Text>
          <Text style={styles.bottomPriceValue}>₹{(discountPrice || price).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.cartBtn, addedToCart && styles.cartBtnSuccess]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons name={addedToCart ? 'checkmark' : 'cart'} size={20} color="#fff" />
          <Text style={styles.cartBtnText}>{addedToCart ? 'Added!' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text, marginHorizontal: 12 },

  // Image
  mainImage: { width, height: 320, resizeMode: 'cover' },
  expandHint: {
    position: 'absolute', bottom: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  expandText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  noImage: {
    width, height: 280,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  thumbnailRow: { marginTop: 12, marginBottom: 4 },
  thumbnail: {
    width: 68, height: 68, borderRadius: 12, marginRight: 10,
    borderWidth: 2, borderColor: 'transparent', overflow: 'hidden',
  },
  thumbnailActive: { borderColor: COLORS.primary },
  thumbnailImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Info Card
  infoCard: { padding: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  categoryBadge: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)',
  },
  categoryText: { color: COLORS.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  discountBadge: {
    backgroundColor: 'rgba(0,230,118,0.1)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(0,230,118,0.25)',
  },
  discountText: { color: '#00E676', fontSize: 11, fontWeight: '800' },
  productName: { fontSize: 24, fontWeight: '900', color: COLORS.text, lineHeight: 30, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 16 },
  ratingText: { color: COLORS.secondary, fontSize: 13, fontWeight: '700', marginLeft: 6 },
  reviewCount: { color: COLORS.textMuted, fontSize: 12 },
  priceBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 20 },
  priceMain: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
  priceOriginal: { fontSize: 18, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 20 },
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: COLORS.text,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  description: { fontSize: 14, color: COLORS.textMuted, lineHeight: 23, marginBottom: 20 },
  detailsGrid: { gap: 0, borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  detailItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  detailLabel: { fontSize: 13, color: COLORS.textMuted },
  detailValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  // Full image modal
  imageModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', alignItems: 'center', justifyContent: 'center' },
  modalClose: {
    position: 'absolute', top: 56, right: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  fullImage: { width: width, height: height * 0.75 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingBottom: 32,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  bottomPrice: { flex: 1 },
  bottomPriceLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  bottomPriceValue: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  cartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 15,
    borderRadius: RADIUS.full,
    ...SHADOWS.brand,
  },
  cartBtnSuccess: { backgroundColor: '#00C853' },
  cartBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

