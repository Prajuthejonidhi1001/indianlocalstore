import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { orderAPI } from '../utils/api';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          setCancellingId(orderId);
          try {
            await orderAPI.cancelOrder(orderId);
            Alert.alert('Cancelled', 'Your order has been cancelled.');
            fetchOrders();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to cancel order');
          } finally {
            setCancellingId(null);
          }
        }}
      ]
    );
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return COLORS.green;
      case 'shipped': return COLORS.primary;
      case 'cancelled': return COLORS.red;
      default: return COLORS.secondary;
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status?.toUpperCase() || 'PROCESSING'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {item.items?.map((orderItem, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.itemQty}>{orderItem.quantity}x</Text>
          <Text style={styles.itemName} numberOfLines={1}>{orderItem.product_name}</Text>
          <Text style={styles.itemPrice}>₹{orderItem.price}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{item.total_amount}</Text>
      </View>

      {/* Cancel button for pending/confirmed orders */}
      {['pending', 'confirmed'].includes(item.order_status) && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancelOrder(item.id)}
          disabled={cancellingId === item.id}
        >
          {cancellingId === item.id
            ? <ActivityIndicator size="small" color="#E74C3C" />
            : <Text style={styles.cancelBtnText}>Cancel Order</Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>Track your recent purchases</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color={COLORS.elevated} />
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptySub}>You haven't placed any orders yet.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 15 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
  
  list: { paddingHorizontal: 20 },
  
  orderCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  orderDate: { fontSize: 13, color: COLORS.textMuted },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemQty: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700', width: 30 },
  itemName: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '600', marginRight: 10 },
  itemPrice: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
  
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  totalLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: COLORS.primary, fontSize: 20, fontWeight: '800' },

  // Cancel order button
  cancelBtn: { marginTop: 12, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: 'rgba(231,76,60,0.4)', backgroundColor: 'rgba(231,76,60,0.06)', alignItems: 'center' },
  cancelBtnText: { color: '#E74C3C', fontWeight: '700', fontSize: 14 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: -50 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 15, marginBottom: 5 },
  emptySub: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginBottom: 30 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: RADIUS.md },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
