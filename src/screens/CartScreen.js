import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, cartLoading, cartTotal, addToCart, removeFromCart, clearCart } = useCart();

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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={16} color={COLORS.red} />
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>Your Cart</Text>
        <Text style={styles.subtitle}>{items.length} items in your cart</Text>
      </View>

      {isEmpty ? (
         <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Looks like you haven't added anything to your cart yet.</Text>
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.primaryBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Cart Items */}
          <View style={styles.itemsList}>
            {items.map((item) => {
              const product = item.product;
              const price = product.discount_price || product.price;
              
              return (
                <View key={item.id} style={styles.cartCard}>
                  <Image 
                    source={{ uri: product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' }} 
                    style={styles.itemImage} 
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.itemPrice}>₹{parseFloat(price).toFixed(2)}</Text>
                    
                    <View style={styles.itemActionsRow}>
                      <View style={styles.qtyControl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(product.id, Math.max(1, item.quantity - 1))}>
                          <Ionicons name="remove" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(product.id, item.quantity + 1)}>
                          <Ionicons name="add" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(product.id)}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
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
              <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryFree}>Free</Text>
            </View>
            
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(231,76,60,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm },
  clearBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginBottom: 5 },
  subtitle: { fontSize: 14, color: COLORS.textMuted },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: -50 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  emptySub: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: RADIUS.md, ...SHADOWS.brand },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  scroll: { paddingBottom: 20 },
  itemsList: { paddingHorizontal: 25 },
  
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  itemImage: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: COLORS.elevated },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  
  itemActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  qtyBtn: { padding: 6 },
  qtyText: { color: COLORS.text, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 5 },

  summaryCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 25,
    marginTop: 10,
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md
  },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 5 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: COLORS.textMuted, fontSize: 14 },
  summaryValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  summaryFree: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  totalLabel: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  totalValue: { color: COLORS.primary, fontSize: 22, fontWeight: '900' },

  checkoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10,
    backgroundColor: COLORS.primary, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    ...SHADOWS.brand 
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
