import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { addressAPI } from '../utils/api';

export default function AddressBookScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: 'Home',
    name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressAPI.getAddresses();
      setAddresses(res.data.results || res.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openModal = (addr = null) => {
    if (addr) {
      setEditingId(addr.id);
      setForm({
        title: addr.title,
        name: addr.name,
        phone: addr.phone,
        address_line: addr.address_line,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        is_default: addr.is_default
      });
    } else {
      setEditingId(null);
      setForm({
        title: 'Home',
        name: '',
        phone: '',
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
    }
    setModalVisible(true);
  };

  const saveAddress = async () => {
    if (!form.name || !form.phone || !form.address_line || !form.city || !form.state || !form.pincode) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    
    try {
      setSaving(true);
      if (editingId) {
        await addressAPI.updateAddress(editingId, form);
        Alert.alert("Success", "Address updated successfully");
      } else {
        await addressAPI.addAddress(form);
        Alert.alert("Success", "Address added successfully");
      }
      setModalVisible(false);
      fetchAddresses();
    } catch (error) {
      Alert.alert("Error", "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = (id) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await addressAPI.deleteAddress(id);
              fetchAddresses();
            } catch (err) {
              Alert.alert("Error", "Failed to delete address");
            }
          }
        }
      ]
    );
  };

  const setAsDefault = async (id) => {
    try {
      await addressAPI.updateAddress(id, { is_default: true });
      fetchAddresses();
    } catch (error) {
      Alert.alert("Error", "Failed to update default address");
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.is_default && styles.defaultCard]}>
      {item.is_default && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons name={item.title.toLowerCase() === 'home' ? 'home' : 'business'} size={16} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>{item.address_line}</Text>
        <Text style={styles.text}>{item.city}, {item.state} - {item.pincode}</Text>
        <Text style={styles.text}>Phone: {item.phone}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
          <Ionicons name="create-outline" size={18} color={COLORS.text} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <View style={styles.actionDivider} />
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => deleteAddress(item.id)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
        
        {!item.is_default && (
          <>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionBtn} onPress={() => setAsDefault(item.id)}>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Set Default</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address Book</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList 
        data={addresses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Addresses Found</Text>
            <Text style={styles.emptySub}>Add a delivery address to make checkout faster.</Text>
          </View>
        }
      />

      {/* Address Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalBody}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Address Title (e.g., Home, Office)</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={t => setForm({...form, title: t})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({...form, phone: t})} keyboardType="phone-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Address Line (House No, Street)</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={form.address_line} onChangeText={t => setForm({...form, address_line: t})} multiline />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput style={styles.input} value={form.city} onChangeText={t => setForm({...form, city: t})} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput style={styles.input} value={form.state} onChangeText={t => setForm({...form, state: t})} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Pincode</Text>
              <TextInput style={styles.input} value={form.pincode} onChangeText={t => setForm({...form, pincode: t})} keyboardType="number-pad" />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Make this default address</Text>
              <Switch 
                value={form.is_default} 
                onValueChange={v => setForm({...form, is_default: v})}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
            
            <TouchableOpacity style={styles.submitBtn} onPress={saveAddress} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Address</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  backBtn: { padding: 5 },
  list: { padding: 15 },
  
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: 15,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    overflow: 'hidden',
    ...SHADOWS.sm
  },
  defaultCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  defaultBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardHeader: {
    padding: 15,
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardBody: {
    padding: 15,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 3,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 5,
  },
  actionDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
  },
  
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  modalBody: { padding: 20 },
  field: { marginBottom: 15 },
  fieldLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 5 },
  input: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
