import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateUser(form);
      if (res.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
     return (
      <View style={styles.container}>
        <View style={styles.guestContent}>
          <View style={styles.guestIcon}>
            <Ionicons name="person-circle" size={80} color={COLORS.elevated} />
          </View>
          <Text style={styles.guestTitle}>Join IndianLocalStore</Text>
          <Text style={styles.guestSub}>Sign in to manage your profile, view orders, and support local shops.</Text>
          
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.labelRow}>
              <Ionicons name="person" size={14} color={COLORS.primary} />
              <Text style={styles.headerLabel}>ACCOUNT</Text>
            </View>
            <View style={styles.headerTop}>
              <Text style={styles.title}>My Profile</Text>
              {!editing ? (
                <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                  <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>Manage your personal information and addresses</Text>
          </View>

          {/* Avatar Card (Exact Web Mirror) */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.first_name?.[0] || user.username?.[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
            <View style={styles.userMeta}>
              <Text style={styles.userHandle}>@{user.username}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role || 'customer'}</Text>
              </View>
            </View>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.contactText}>{user.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.contactText}>{user.phone || 'No phone provided'}</Text>
              </View>
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            {user?.role === 'seller' && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('SellerDashboard')}>
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIcon, { backgroundColor: 'rgba(0,230,118,0.1)' }]}>
                    <Ionicons name="storefront" size={20} color="#00E676" />
                  </View>
                  <Text style={styles.linkText}>Seller Dashboard</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Orders')}>
              <View style={styles.linkLeft}>
                <View style={[styles.linkIcon, { backgroundColor: 'rgba(255,182,39,0.1)' }]}>
                  <Ionicons name="receipt" size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.linkText}>My Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Cart')}>
              <View style={styles.linkLeft}>
                <View style={[styles.linkIcon, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                  <Ionicons name="cart" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.linkText}>My Cart</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Details Form Sections */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>First Name</Text>
                <TextInput 
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={form.first_name}
                  onChangeText={t => setForm({...form, first_name: t})}
                  editable={editing}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <TextInput 
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={form.last_name}
                  onChangeText={t => setForm({...form, last_name: t})}
                  editable={editing}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput 
                style={[styles.input, !editing && styles.inputDisabled]}
                value={form.phone}
                onChangeText={t => setForm({...form, phone: t})}
                editable={editing}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Delivery Address</Text>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Address</Text>
              <TextInput 
                style={[styles.input, !editing && styles.inputDisabled, { height: 80, textAlignVertical: 'top' }]}
                value={form.address}
                onChangeText={t => setForm({...form, address: t})}
                editable={editing}
                multiline
                placeholder="House No, Street, Landmark..."
                placeholderTextColor={COLORS.textDim}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput 
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={form.city}
                  onChangeText={t => setForm({...form, city: t})}
                  editable={editing}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput 
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={form.state}
                  onChangeText={t => setForm({...form, state: t})}
                  editable={editing}
                />
              </View>
            </View>

            <View style={[styles.field, { width: '50%' }]}>
              <Text style={styles.fieldLabel}>Pincode</Text>
              <TextInput 
                style={[styles.input, !editing && styles.inputDisabled]}
                value={form.pincode}
                onChangeText={t => setForm({...form, pincode: t})}
                editable={editing}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          {/* Logout Section */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
            <Text style={styles.logoutText}>Sign Out of Account</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 20 },
  
  // Header
  header: { paddingHorizontal: 25, paddingTop: 30, marginBottom: 25 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  headerLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },

  // Edit Buttons
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,107,53,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md },
  editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: '600' },
  saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.md, ...SHADOWS.sm },
  saveBtnText: { color: '#fff', fontWeight: '700' },

  // Avatar Card
  avatarCard: { 
    marginHorizontal: 25, 
    padding: 25, 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.lg, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    marginBottom: 30
  },
  avatarCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15,
    ...SHADOWS.brand
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 5 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  userHandle: { color: COLORS.textMuted, fontSize: 14 },
  roleBadge: { backgroundColor: 'rgba(255,107,53,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  roleText: { color: COLORS.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  contactInfo: { width: '100%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15, gap: 10 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { color: COLORS.textMuted, fontSize: 13 },

  // Form Section
  formSection: { paddingHorizontal: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 15 },
  field: { marginBottom: 15 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { 
    backgroundColor: COLORS.elevated, 
    borderWidth: 1.5, 
    borderColor: COLORS.border, 
    borderRadius: RADIUS.md, 
    padding: 12, 
    color: COLORS.text, 
    fontSize: 15 
  },
  inputDisabled: { 
    backgroundColor: 'transparent', 
    borderColor: 'transparent', 
    paddingLeft: 0, 
    color: COLORS.textMuted 
  },

  // Quick Links
  quickLinks: { paddingHorizontal: 25, marginBottom: 30 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: 16, borderRadius: RADIUS.lg, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  linkIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  // Logout
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    marginHorizontal: 25, 
    marginTop: 20, 
    paddingVertical: 18, 
    borderRadius: RADIUS.lg, 
    backgroundColor: 'rgba(231,76,60,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.15)'
  },
  logoutText: { color: COLORS.red, fontWeight: '700', fontSize: 16 },

  // Guest State
  guestContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  guestIcon: { marginBottom: 30 },
  guestTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  guestSub: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 35 },
  primaryBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 18, borderRadius: RADIUS.lg, alignItems: 'center', marginBottom: 15, ...SHADOWS.brand },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  secondaryBtn: { backgroundColor: COLORS.elevated, width: '100%', paddingVertical: 18, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  secondaryBtnText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
});
