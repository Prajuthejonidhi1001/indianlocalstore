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
  KeyboardAvoidingView,
  Platform,
  Animated
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
  const [fadeAnim] = useState(new Animated.Value(0));

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
  const [fetchingPin, setFetchingPin] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressAPI.getAddresses();
      setAddresses(res.data.results || res.data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
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
      setForm({ ...addr });
    } else {
      setEditingId(null);
      setForm({ title: 'Home', name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false });
    }
    setModalVisible(true);
  };

  const handlePincodeChange = async (pin) => {
    setForm(prev => ({ ...prev, pincode: pin }));
    if (pin.length === 6) {
      setFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
          const postOffice = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (e) {
        console.log('Failed to fetch pincode details', e);
      } finally {
        setFetchingPin(false);
      }
    }
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
      } else {
        await addressAPI.addAddress(form);
      }
      setModalVisible(false);
      fetchAddresses();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await addressAPI.deleteAddress(id);
            fetchAddresses();
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to delete address");
          }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.is_default && styles.cardDefault]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleWrap}>
          <Ionicons name={item.title === 'Home' ? 'home' : item.title === 'Work' ? 'briefcase' : 'location'} size={18} color={item.is_default ? COLORS.primary : COLORS.text} />
          <Text style={[styles.title, item.is_default && { color: COLORS.primary }]}>{item.title}</Text>
          {item.is_default && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>DEFAULT</Text></View>}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteAddress(item.id)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.addressText}>{item.address_line}</Text>
        <Text style={styles.addressText}>{item.city}, {item.state} {item.pincode}</Text>
        <Text style={styles.phoneText}>+91 {item.phone}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={addresses}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="map-outline" size={60} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No Addresses Yet</Text>
                <Text style={styles.emptySub}>Add a delivery address to proceed with your orders smoothly.</Text>
              </View>
            }
          />
        </Animated.View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'New Address'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={[{key: 'form'}]}
            renderItem={() => (
              <View style={styles.modalContent}>
                <View style={styles.typeSelector}>
                  {['Home', 'Work', 'Other'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeBtn, form.title === type && styles.typeBtnActive]}
                      onPress={() => setForm({ ...form, title: type })}
                    >
                      <Text style={[styles.typeBtnText, form.title === type && styles.typeBtnTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="John Doe" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({...form, phone: t})} keyboardType="phone-pad" placeholder="9876543210" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Address Line (House No, Building, Street)</Text>
                  <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={form.address_line} onChangeText={t => setForm({...form, address_line: t})} multiline placeholder="Enter full address" placeholderTextColor={COLORS.textMuted} />
                </View>
                
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>City</Text>
                    <TextInput style={styles.input} value={form.city} onChangeText={t => setForm({...form, city: t})} placeholder="City" placeholderTextColor={COLORS.textMuted} />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>State</Text>
                    <TextInput style={styles.input} value={form.state} onChangeText={t => setForm({...form, state: t})} placeholder="State" placeholderTextColor={COLORS.textMuted} />
                  </View>
                </View>

                <View style={styles.field}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text style={[styles.label, { marginBottom: 0 }]}>Pincode</Text>
                    {fetchingPin && <ActivityIndicator size="small" color={COLORS.primary} />}
                  </View>
                  <TextInput style={styles.input} value={form.pincode} onChangeText={handlePincodeChange} keyboardType="number-pad" maxLength={6} placeholder="123456" placeholderTextColor={COLORS.textMuted} />
                </View>

                <TouchableOpacity 
                  style={styles.defaultRow} 
                  activeOpacity={0.7} 
                  onPress={() => setForm({...form, is_default: !form.is_default})}
                >
                  <View style={[styles.checkbox, form.is_default && styles.checkboxActive]}>
                    {form.is_default && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.defaultText}>Set as default delivery address</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={saveAddress} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
                </TouchableOpacity>
              </View>
            )}
          />
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.elevated, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  
  listContainer: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  cardDefault: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: 'rgba(255,107,53,0.02)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },
  defaultBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  defaultBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
  
  cardBody: {},
  nameText: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  addressText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  phoneText: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 8 },
  
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 40 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.medium },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md, gap: 8 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.elevated, justifyContent: 'center', alignItems: 'center' },
  
  modalContent: { padding: 20 },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive: { backgroundColor: 'rgba(255,107,53,0.1)', borderColor: COLORS.primary },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  typeBtnTextActive: { color: COLORS.primary },

  field: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, fontSize: 15, color: COLORS.text },
  
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 24 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  defaultText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  
  saveBtn: { backgroundColor: COLORS.text, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
