import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useCart } from '../context/CartContext';
import { resolveMediaUrl } from '../config';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';

export default function CartScreen({ navigation }) {
  const { cart, cartLoading, cartTotal, cartSubtotal, addToCart, removeFromCart, clearCart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');

  if (cartLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const handleClear = () => {
    Alert.alert(
      "Clear Cart", 
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearCart }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          {!isEmpty && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={14} color={COLORS.red} />
              <Text style={styles.clearBtnText}>Clear Cart</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>Your Cart</Text>
        <Text style={styles.subtitle}>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</Text>
      </View>

      {isEmpty ? (
         <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Looks like you haven't added anything to your cart yet.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.primaryBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Cart Items */}
          <View style={styles.itemsList}>
            {items.map((item) => {
              const productId = item.product;
              const name = item.product_name || 'Product';
              const price = item.product_price || 0;
              const discountPrice = item.product_discount_price || null;
              const effectivePrice = discountPrice || price;
              const imgSrc = resolveMediaUrl(item.product_image, PLACEHOLDER_IMAGE);
              
              let itemVariants = item.variants || {};
              if (typeof itemVariants === 'string') {
                try { itemVariants = JSON.parse(itemVariants); } catch(e) { itemVariants = {}; }
              }
              
              return (
                <View key={item.id} style={styles.cartCard}>
                  <View style={styles.itemImageWrap}>
                    <Image source={{ uri: imgSrc }} style={styles.itemImage} />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={styles.itemPrice}>₹{parseFloat(effectivePrice).toFixed(2)}</Text>{discountPrice && <Text style={{ fontSize: 12, textDecorationLine: 'line-through', color: '#999' }}>₹{parseFloat(price).toFixed(2)}</Text>}</View>
                    
                    {Object.keys(itemVariants).length > 0 && (
                      <Text style={styles.itemVariants}>
                        {Object.entries(itemVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </Text>
                    )}
                    
                    <View style={styles.itemActionsRow}>
                      <View style={styles.qtyControl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}>
                          <Ionicons name="remove" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartItem(item.id, item.quantity + 1)}>
                          <Ionicons name="add" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.itemLineTotal}>
                    <Text style={styles.lineTotalText}>₹{(parseFloat(effectivePrice) * item.quantity).toFixed(2)}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
              <Text style={styles.summaryValue}>₹{cartSubtotal?.toFixed(2)}</Text>
            </View>

            {cart?.applied_coupon_code ? (
              <View style={styles.summaryRow}>
                <View style={styles.couponBadge}>
                  <Ionicons name="pricetag" size={12} color={COLORS.green} />
                  <Text style={styles.couponText}>{cart.applied_coupon_code} ({cart.coupon_discount_percent}% OFF)</Text>
                  <TouchableOpacity onPress={removeCoupon} style={{marginLeft: 6}}>
                    <Ionicons name="close" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.discountValue}>-₹{(cartSubtotal - cartTotal).toFixed(2)}</Text>
              </View>
            ) : (
              <View style={styles.couponInputRow}>
                <TextInput 
                  style={styles.couponInput} 
                  placeholder="Promo Code" 
                  value={couponCode}
                  onChangeText={t => setCouponCode(t.toUpperCase())}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={() => applyCoupon(couponCode)}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryFree}>Free</Text>
            </View>
            
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Home')}>
              <Ionicons name="cart-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.continueBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: COLORS.surface },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md },
  clearBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textMuted },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: -50 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: RADIUS.full, ...SHADOWS.brand },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  scroll: { paddingBottom: 60 },
  itemsList: { paddingHorizontal: 20, paddingTop: 10 },
  
  cartCard: { flexDirection: 'row', padding: 16, backgroundColor: COLORS.elevated, borderRadius: RADIUS.lg, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', ...SHADOWS.medium },
  itemImageWrap: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: COLORS.elevated, overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  itemDetails: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  itemPrice: { fontSize: 15, color: COLORS.textMuted },
  itemVariants: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  
  itemActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { color: COLORS.text, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 6 },
  
  itemLineTotal: { justifyContent: 'center' },
  lineTotalText: { fontSize: 16, fontWeight: '900', color: '#FFB627' },

  summaryCard: { marginHorizontal: 20, marginTop: 24, borderRadius: RADIUS.lg, padding: 24, backgroundColor: COLORS.elevated, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { color: COLORS.textMuted, fontSize: 14 },
  summaryValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  summaryFree: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  
  couponBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34₹97,94,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full },
  couponText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  discountValue: { color: COLORS.green, fontSize: 14, fontWeight: '600' },
  
  couponInputRow: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  couponInput: { flex: 1, height: 44, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16 },
  applyBtn: { height: 44, paddingHorizontal: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: COLORS.primary, fontWeight: '700' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' },
  totalLabel: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  totalValue: { color: COLORS.primary, fontSize: 24, fontWeight: '900' },

  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF6B00', paddingVertical: 18, borderRadius: RADIUS.full, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  
  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  continueBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});





