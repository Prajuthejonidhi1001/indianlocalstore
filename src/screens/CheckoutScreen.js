import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';

export default function CheckoutScreen({ navigation }) {
  const { cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // These keys must match the API's field names exactly. They were previously
  // `city` / `state` / `pincode`, which the serializer ignored -- so every
  // order failed with "this field is required" for the delivery_* fields.
  const [form, setForm] = useState({
    delivery_address: user?.address || '',
    delivery_city: user?.city || '',
    delivery_state: user?.state || '',
    delivery_pincode: user?.pincode || '',
  });

  const handlePlaceOrder = async () => {
    if (!form.delivery_address.trim()) {
      return Alert.alert('Address needed', 'Please enter your delivery address.');
    }
    if (!form.delivery_city.trim() || !form.delivery_state.trim()) {
      return Alert.alert('Address needed', 'Please enter your city and state.');
    }
    if (!/^\d{6}$/.test(form.delivery_pincode.trim())) {
      return Alert.alert('Check pincode', 'Please enter a valid 6-digit pincode.');
    }

    setLoading(true);
    try {
      const res = await orderAPI.createOrder({
        delivery_address: form.delivery_address.trim(),
        delivery_city: form.delivery_city.trim(),
        delivery_state: form.delivery_state.trim(),
        delivery_pincode: form.delivery_pincode.trim(),
        payment_method: paymentMethod,
      });

      await clearCart();

      const orderNumber = res.data?.order_id || res.data?.id || '';

      Alert.alert(
        'Order placed 🎉',
        orderNumber
          ? `Your order ${orderNumber} is confirmed. Pay cash when it arrives.`
          : 'Your order is confirmed. Pay cash when it arrives.',
        [{ text: 'View Orders', onPress: () => navigation.navigate('Orders') }]
      );
    } catch (err) {
      // DRF returns either {error: "..."} or {field: ["..."]}. Surface whichever
      // arrived instead of a blanket failure message the customer can't act on.
      const data = err.response?.data;
      let message = 'Could not place your order. Please try again.';
      if (typeof data?.error === 'string') {
        message = data.error;
      } else if (data && typeof data === 'object') {
        const firstField = Object.values(data)[0];
        if (Array.isArray(firstField) && firstField.length) message = String(firstField[0]);
        else if (typeof firstField === 'string') message = firstField;
      }
      Alert.alert('Order failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Secure Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Total Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Amount Payable</Text>
          <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
        </View>

        {/* Address Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Complete Address</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={form.delivery_address}
              onChangeText={t => setForm({...form, delivery_address: t})}
              multiline
              placeholder="House, Street, Area..."
              placeholderTextColor={COLORS.textDim}
            />
            
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                 <Text style={styles.fieldLabel}>City</Text>
                 <TextInput
                  style={styles.input}
                  value={form.delivery_city}
                  onChangeText={t => setForm({...form, delivery_city: t})}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                 <Text style={styles.fieldLabel}>State</Text>
                 <TextInput
                  style={styles.input}
                  value={form.delivery_state}
                  onChangeText={t => setForm({...form, delivery_state: t})}
                />
              </View>
            </View>

            <View style={[styles.field, { width: '50%' }]}>
              <Text style={styles.fieldLabel}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={form.delivery_pincode}
                onChangeText={t => setForm({...form, delivery_pincode: t})}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity 
            style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.paymentRow}>
              <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? COLORS.primary : COLORS.textMuted} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>Cash on Delivery</Text>
                <Text style={styles.paymentDesc}>Pay directly to the seller upon arrival</Text>
              </View>
              <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]}>
                {paymentMethod === 'cod' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Online payment is intentionally not selectable yet. Razorpay live
              keys require completed business KYC; until then an order marked
              "online" would ship with no way for the customer to actually pay.
              Leaving it visible but disabled sets the expectation without
              creating an unpaid-order hole. */}
          <View style={[styles.paymentCard, { opacity: 0.5 }]}>
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={24} color={COLORS.textMuted} />
              <View style={styles.paymentInfo}>
                <View style={styles.paymentNameRow}>
                  <Text style={styles.paymentName}>Pay Online</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>COMING SOON</Text>
                  </View>
                </View>
                <Text style={styles.paymentDesc}>UPI, Credit Card, Net Banking</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handlePlaceOrder} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.submitText}>Confirm Order (₹{cartTotal.toFixed(2)})</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 15 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },

  scroll: { paddingHorizontal: 20 },
  
  summaryBox: { backgroundColor: 'rgba(255,107,53,0.1)', paddingVertical: 20, borderRadius: RADIUS.lg, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)' },
  summaryLabel: { color: COLORS.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  summaryValue: { color: COLORS.text, fontSize: 32, fontWeight: '900' },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  
  card: { backgroundColor: COLORS.card, padding: 20, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  row: { flexDirection: 'row', marginBottom: 15 },
  field: { marginBottom: 15 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: COLORS.elevated, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, color: COLORS.text, fontSize: 15 },

  paymentCard: { backgroundColor: COLORS.card, padding: 15, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 12 },
  paymentActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(255,107,53,0.05)' },
  paymentRow: { flexDirection: 'row', alignItems: 'center' },
  paymentInfo: { flex: 1, marginLeft: 15 },
  paymentName: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  paymentDesc: { color: COLORS.textMuted, fontSize: 12 },
  paymentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  comingSoonBadge: { backgroundColor: 'rgba(255,107,53,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'rgba(255,107,53,0.3)' },
  comingSoonText: { color: COLORS.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.textDim, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.lg, ...SHADOWS.brand, marginTop: 10 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
