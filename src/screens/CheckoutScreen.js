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

  const [form, setForm] = useState({
    delivery_address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const handlePlaceOrder = async () => {
    if (!form.delivery_address || !form.city || !form.pincode) {
      return Alert.alert('Error', 'Please fill in all address fields.');
    }

    setLoading(true);
    try {
      const orderData = {
        ...form,
        payment_method: paymentMethod,
      };

      const res = await orderAPI.createOrder(orderData);
      await clearCart();
      
      Alert.alert(
        'Order Placed Successfully! 🎉', 
        `Your order #${res.data.id} has been confirmed.`,
        [{ text: 'View Orders', onPress: () => navigation.navigate('Orders') }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to place order');
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
                  value={form.city}
                  onChangeText={t => setForm({...form, city: t})}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                 <Text style={styles.fieldLabel}>State</Text>
                 <TextInput 
                  style={styles.input}
                  value={form.state}
                  onChangeText={t => setForm({...form, state: t})}
                />
              </View>
            </View>

            <View style={[styles.field, { width: '50%' }]}>
              <Text style={styles.fieldLabel}>Pincode</Text>
              <TextInput 
                style={styles.input}
                value={form.pincode}
                onChangeText={t => setForm({...form, pincode: t})}
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

          <TouchableOpacity 
            style={[styles.paymentCard, paymentMethod === 'online' && styles.paymentActive]}
            onPress={() => setPaymentMethod('online')}
          >
            <View style={styles.paymentRow}>
              <Ionicons name="card-outline" size={24} color={paymentMethod === 'online' ? COLORS.primary : COLORS.textMuted} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>Pay Online</Text>
                <Text style={styles.paymentDesc}>UPI, Credit Card, Net Banking (Razorpay)</Text>
              </View>
              <View style={[styles.radio, paymentMethod === 'online' && styles.radioActive]}>
                {paymentMethod === 'online' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
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
  
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.textDim, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.lg, ...SHADOWS.brand, marginTop: 10 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
