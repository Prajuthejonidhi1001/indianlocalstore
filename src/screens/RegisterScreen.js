import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Image, ActivityIndicator, Animated, Easing, 
  KeyboardAvoidingView, Platform, Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI } from '../utils/api';

export default function RegisterScreen({ navigation }) {
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Form State
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', role: 'customer',
    shopName: '', shopAddress: '', pincode: '',
    state: '', district: '', taluk: '',
    category: '', subcategory: '',
  });

  const [shopPhoto, setShopPhoto] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [locating, setLocating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  // Load categories when switching to seller
  useEffect(() => {
    if (form.role === 'seller' && categories.length === 0) {
      productAPI.getCategories()
        .then(r => setCategories(r.data.results || r.data))
        .catch(() => {});
    }
  }, [form.role]);

  // Load subcategories on category select
  useEffect(() => {
    if (form.category) {
      setSubcategories([]);
      setForm(f => ({ ...f, subcategory: '' }));
      productAPI.getSubCategories(form.category)
        .then(r => setSubcategories(r.data.results || r.data))
        .catch(() => {});
    }
  }, [form.category]);

  const triggerShake = () => {
    Vibration.vibrate(80);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    const fetchPinData = async () => {
      if (form.pincode.length === 6 && /^\d+$/.test(form.pincode)) {
        setFetchingPin(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
          const data = await res.json();
          if (data && data[0].Status === 'Success') {
            const offices = data[0].PostOffice;
            const uniqueTaluks = [...new Set(offices.map(po => po.Block))].filter(Boolean);
            setForm(f => ({ ...f, state: offices[0].State, district: offices[0].District, taluk: uniqueTaluks[0] || offices[0].District }));
            setTaluks(uniqueTaluks.length > 0 ? uniqueTaluks : [offices[0].District]);
          } else {
            setForm(f => ({ ...f, state: '', district: '', taluk: '' }));
            setTaluks([]);
          }
        } catch {} finally { setFetchingPin(false); }
      }
    };
    fetchPinData();
  }, [form.pincode]);

  const handlePasswordChange = (pw) => {
    setForm({ ...form, password: pw });
    let score = 0;
    if (pw.length > 7) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setPasswordStrength(score);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { triggerShake(); Alert.alert('Permission Denied'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setShopPhoto(result.assets[0]);
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { triggerShake(); Alert.alert('Permission Denied'); setLocating(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Alert.alert('✅ Location Captured', 'GPS coordinates saved.');
    } catch { triggerShake(); Alert.alert('Error', 'Failed to get location'); }
    finally { setLocating(false); }
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.first_name || !form.last_name || !form.phone || !form.password) {
      triggerShake(); return Alert.alert('Missing Fields', 'Please fill all basic details.');
    }
    if (form.password.length < 8) {
      triggerShake(); return Alert.alert('Weak Password', 'Min 8 characters.');
    }
    if (form.role === 'seller' && (!form.shopName || !form.shopAddress || !form.pincode || !form.state)) {
      triggerShake(); return Alert.alert('Missing Info', 'Fill all shop details.');
    }
    if (form.role === 'seller' && !form.category) {
      triggerShake(); return Alert.alert('Category Required', 'Please select your shop category.');
    }

    setLoading(true);
    try {
      const userData = {
        username: form.username, email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name,
        phone: form.phone, role: form.role,
        address: form.shopAddress, city: form.district, state: form.state, pincode: form.pincode
      };
      const res = await register(userData);
      if (!res.success) { triggerShake(); Alert.alert('Registration Failed', res.error); setLoading(false); return; }

      if (form.role === 'seller') {
        await login(form.username, form.password);
        const shopData = new FormData();
        shopData.append('name', form.shopName);
        shopData.append('email', form.email);
        shopData.append('phone', form.phone);
        shopData.append('pincode', form.pincode);
        shopData.append('address', form.shopAddress);
        shopData.append('city', form.district);
        shopData.append('state', form.state);
        shopData.append('latitude', String(coords.lat || 20.5937));
        shopData.append('longitude', String(coords.lng || 78.9629));
        shopData.append('description', `${form.shopName} in ${form.taluk}, ${form.district}`);
        if (shopPhoto) {
          const filename = shopPhoto.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          shopData.append('logo', { uri: shopPhoto.uri, name: filename, type: match ? `image/${match[1]}` : 'image/jpeg' });
        }
        await shopAPI.createShop(shopData);
        Alert.alert('🎉 Welcome!', 'Account & Shop created successfully!');
      } else {
        Alert.alert('✅ Done!', 'Account created! Please log in.');
        navigation.goBack();
      }
    } catch {
      triggerShake();
      Alert.alert('Error', 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon, placeholder, value, key, secure = false, type = 'default', extraProps = {}) => (
    <View style={[styles.inputRow, focusedInput === key && styles.inputRowFocused]}>
      <Ionicons name={icon} size={18} color={focusedInput === key ? '#FF6B00' : COLORS.textMuted} style={{ marginRight: 10 }} />
      <TextInput
        placeholder={placeholder} value={value}
        onChangeText={t => setForm({ ...form, [key]: t })}
        style={styles.inputText} secureTextEntry={secure && !showPass}
        keyboardType={type} placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        onFocus={() => setFocusedInput(key)} onBlur={() => setFocusedInput(null)}
        {...extraProps}
      />
      {secure && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  const strengthColor = passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71';
  const strengthLabel = passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong';

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient orb */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }]}>

            {/* ── Header ── */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.logoBox}>
                <Ionicons name="storefront" size={20} color="#fff" />
              </View>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Shop & sell locally</Text>

            {/* ── Role Toggle — AT THE TOP ── */}
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, form.role === 'customer' && styles.roleBtnActive]}
                onPress={() => setForm({ ...form, role: 'customer' })}
                activeOpacity={0.8}
              >
                <Ionicons name="person" size={16} color={form.role === 'customer' ? '#fff' : COLORS.textMuted} />
                <Text style={[styles.roleText, form.role === 'customer' && styles.roleTextActive]}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, form.role === 'seller' && styles.roleBtnActiveSeller]}
                onPress={() => setForm({ ...form, role: 'seller' })}
                activeOpacity={0.8}
              >
                <Ionicons name="cart" size={16} color={form.role === 'seller' ? '#fff' : COLORS.textMuted} />
                <Text style={[styles.roleText, form.role === 'seller' && styles.roleTextActive]}>Seller</Text>
              </TouchableOpacity>
            </View>

            {/* ── Basic Fields ── */}
            <View style={styles.row}>
              <View style={styles.half}>
                {renderInput('person-outline', 'First Name', form.first_name, 'first_name')}
              </View>
              <View style={{ width: 10 }} />
              <View style={styles.half}>
                {renderInput('person-outline', 'Last Name', form.last_name, 'last_name')}
              </View>
            </View>
            {renderInput('at-outline', 'Username', form.username, 'username')}
            {renderInput('mail-outline', 'Email', form.email, 'email', false, 'email-address')}
            {renderInput('call-outline', 'Phone', form.phone, 'phone', false, 'phone-pad')}
            {renderInput('lock-closed-outline', 'Password (min 8)', form.password, 'password', true)}

            {form.password.length > 0 && (
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { width: `${(passwordStrength / 4) * 100}%`, backgroundColor: strengthColor }]} />
                <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
              </View>
            )}

            {/* ── Seller Section ── */}
            {form.role === 'seller' && (
              <View style={styles.sellerBox}>
                <Text style={styles.sellerTitle}>🏪 Business Details</Text>

                {renderInput('business-outline', 'Shop Name', form.shopName, 'shopName')}

                {/* Shop Logo */}
                <TouchableOpacity style={styles.photoPicker} onPress={pickImage} activeOpacity={0.8}>
                  {shopPhoto ? (
                    <Image source={{ uri: shopPhoto.uri }} style={styles.photoImg} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera" size={28} color={COLORS.textMuted} />
                      <Text style={styles.photoText}>Upload Shop Logo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Category — single selection */}
                <Text style={styles.fieldLabel}>Shop Category *</Text>
                <View style={styles.chipGrid}>
                  {categories.length === 0 ? (
                    <Text style={styles.dimText}>Loading…</Text>
                  ) : categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, form.category === String(cat.id) && styles.chipSelected]}
                      onPress={() => setForm(f => ({ ...f, category: String(cat.id), subcategory: '' }))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, form.category === String(cat.id) && styles.chipTextSelected]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Subcategory — single selection */}
                {subcategories.length > 0 && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Subcategory <Text style={styles.dimText}>(optional)</Text></Text>
                    <View style={styles.chipGrid}>
                      {subcategories.map(sub => (
                        <TouchableOpacity
                          key={sub.id}
                          style={[styles.chip, styles.chipSm, form.subcategory === String(sub.id) && styles.chipSelected]}
                          onPress={() => setForm(f => ({ ...f, subcategory: String(sub.id) }))}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, form.subcategory === String(sub.id) && styles.chipTextSelected]}>
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Pincode + Auto Location */}
                <Text style={styles.fieldLabel}>📍 Pincode {fetchingPin && <Text style={{ color: COLORS.primary }}> (fetching…)</Text>}</Text>
                {renderInput('map-outline', '560001', form.pincode, 'pincode', false, 'numeric', { maxLength: 6 })}

                {/* Auto-filled location */}
                {(form.state || form.district) && (
                  <View style={styles.autoRow}>
                    <View style={styles.autoChip}>
                      <Text style={styles.autoLabel}>🏛️ State</Text>
                      <Text style={styles.autoValue}>{form.state || '—'}</Text>
                    </View>
                    <View style={styles.autoChip}>
                      <Text style={styles.autoLabel}>🗺️ District</Text>
                      <Text style={styles.autoValue}>{form.district || '—'}</Text>
                    </View>
                  </View>
                )}

                {renderInput('navigate-outline', 'Full Shop Address', form.shopAddress, 'shopAddress')}

                {/* GPS button */}
                <TouchableOpacity
                  style={[styles.gpsBtn, coords.lat && styles.gpsBtnDone]}
                  onPress={detectLocation}
                  disabled={locating}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={coords.lat ? 'checkmark-circle' : 'locate'}
                    size={18}
                    color={coords.lat ? '#2ECC71' : COLORS.textMuted}
                  />
                  <Text style={[styles.gpsBtnText, coords.lat && { color: '#2ECC71' }]}>
                    {locating ? 'Detecting GPS…' : coords.lat ? 'GPS Captured ✅' : 'Detect GPS Location'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.submitText}>Create Account</Text><Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} /></>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerText}>Already have an account? <Text style={styles.footerAction}>Sign In</Text></Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070a12' },
  bgOrb1: { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,107,53,0.12)' },
  bgOrb2: { position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(85,33,255,0.1)' },
  scroll: { flexGrow: 1, padding: 18, paddingBottom: 40 },
  card: { backgroundColor: 'rgba(18,22,32,0.92)', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', ...SHADOWS.xl },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },

  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8b9bb4', marginBottom: 22 },

  // Role Row — clean, at top
  roleRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: 4, marginBottom: 22, gap: 4 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 11, gap: 6 },
  roleBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  roleBtnActiveSeller: { backgroundColor: 'rgba(255,107,53,0.2)', borderWidth: 1, borderColor: '#FF6B00' },
  roleText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  roleTextActive: { color: '#fff' },

  row: { flexDirection: 'row', marginBottom: 0 },
  half: { flex: 1 },

  // Input
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)' },
  inputRowFocused: { borderColor: '#FF6B00', backgroundColor: 'rgba(255,107,53,0.05)' },
  inputText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500' },

  // Password strength
  strengthBar: { marginBottom: 14, marginTop: -4 },
  strengthFill: { height: 4, borderRadius: 2, marginBottom: 4 },
  strengthLabel: { fontSize: 11, textAlign: 'right', fontWeight: '700' },

  // Seller box
  sellerBox: { backgroundColor: 'rgba(255,107,53,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)', borderRadius: 20, padding: 16, marginBottom: 16, gap: 0 },
  sellerTitle: { fontSize: 15, fontWeight: '800', color: '#FF6B00', marginBottom: 14 },

  // Photo picker
  photoPicker: { height: 110, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', marginBottom: 16, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },

  // Category chips
  fieldLabel: { fontSize: 12, fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  dimText: { color: COLORS.textMuted, fontSize: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  chipSm: { paddingHorizontal: 10, paddingVertical: 6 },
  chipSelected: { borderColor: '#FF6B00', backgroundColor: 'rgba(255,107,53,0.18)' },
  chipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },

  // Auto-filled location
  autoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  autoChip: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  autoLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', marginBottom: 2 },
  autoValue: { fontSize: 13, color: '#fff', fontWeight: '600' },

  // GPS button
  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 4, marginTop: 4 },
  gpsBtnDone: { borderColor: 'rgba(46,204,113,0.4)', backgroundColor: 'rgba(46,204,113,0.06)' },
  gpsBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },

  // Submit
  submitBtn: { flexDirection: 'row', height: 56, borderRadius: 14, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', marginTop: 16, ...SHADOWS.sm },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  footerLink: { marginTop: 20, alignItems: 'center', paddingBottom: 8 },
  footerText: { color: '#8b9bb4', fontSize: 14 },
  footerAction: { color: '#FF6B00', fontWeight: '800' },
});
