import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Image, ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../utils/api';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Form State
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', role: 'customer',
    // Seller Fields
    shopName: '', shopAddress: '', pincode: '',
    state: '', district: '', taluk: '',
  });

  const [shopPhoto, setShopPhoto] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.cubic) })
    ]).start();

    // Background Animation
    const float = (val, to, duration) => Animated.sequence([
      Animated.timing(val, { toValue: to, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(val, { toValue: 0, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) })
    ]);
    
    Animated.loop(float(blob1Anim, 20, 3500)).start();
    Animated.loop(float(blob2Anim, -20, 4500)).start();
  }, []);

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
        } catch (e) {
          console.error(e);
        } finally {
          setFetchingPin(false);
        }
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
    if (status !== 'granted') return Alert.alert('Permission Denied', 'We need access to your gallery');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setShopPhoto(result.assets[0]);
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location is needed for sellers'); setLocating(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Alert.alert('Success', 'Shop location detected!');
    } catch {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLocating(false);
    }
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.first_name || !form.last_name || !form.phone || !form.password) {
      return Alert.alert('Missing Fields', 'Please fill all basic details.');
    }
    if (form.password.length < 8) {
      return Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
    }
    if (form.role === 'seller' && (!form.shopName || !form.shopAddress || !form.pincode || !form.state)) {
      return Alert.alert('Missing Shop Info', 'Please fill all required business details.');
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
      if (!res.success) {
        Alert.alert('Registration Failed', res.error);
        setLoading(false);
        return;
      }

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
          const type = match ? `image/${match[1]}` : `image`;
          shopData.append('logo', { uri: shopPhoto.uri, name: filename, type });
        }
        await shopAPI.createShop(shopData);
        Alert.alert('Success', 'Account & Shop created! Welcome aboard.');
      } else {
        Alert.alert('Success', 'Account created! Please log in.');
        navigation.goBack();
      }
    } catch {
      Alert.alert('Error', 'Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon, placeholder, value, key, secure = false, type = 'default', extraProps = {}) => (
    <View style={[styles.inputContainer, focusedInput === key && styles.inputFocused]}>
      <Ionicons name={icon} size={20} color={focusedInput === key ? COLORS.primary : COLORS.textMuted} style={styles.icon} />
      <TextInput 
        placeholder={placeholder} value={value} onChangeText={(t) => setForm({ ...form, [key]: t })}
        style={styles.input} secureTextEntry={secure && !showPass} keyboardType={type}
        placeholderTextColor={COLORS.borderStrong} autoCapitalize="none"
        onFocus={() => setFocusedInput(key)} onBlur={() => setFocusedInput(null)}
        {...extraProps}
      />
      {secure && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
          <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.blob, styles.blob1, { transform: [{ translateY: blob1Anim }, { translateX: blob1Anim }] }]} />
      <Animated.View style={[styles.blob, styles.blob2, { transform: [{ translateY: blob2Anim }, { translateX: Animated.multiply(blob2Anim, -1) }] }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.logoBox}><Ionicons name="storefront" size={22} color="#FFF" /></View>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of local shoppers & sellers</Text>

            {/* Role Selection */}
            <View style={styles.roleWrap}>
              <TouchableOpacity style={[styles.roleBtn, form.role === 'customer' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'customer' })}>
                <Ionicons name="person" size={18} color={form.role === 'customer' ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.roleText, form.role === 'customer' && styles.roleTextActive]}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, form.role === 'seller' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'seller' })}>
                <Ionicons name="cart" size={18} color={form.role === 'seller' ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.roleText, form.role === 'seller' && styles.roleTextActive]}>Seller</Text>
              </TouchableOpacity>
            </View>

            {/* Basic Info */}
            <View style={styles.row}>
              <View style={styles.flexHalf}>{renderInput('person-outline', 'First Name', form.first_name, 'first_name')}</View>
              <View style={{width: 12}} />
              <View style={styles.flexHalf}>{renderInput('person-outline', 'Last Name', form.last_name, 'last_name')}</View>
            </View>
            {renderInput('at-outline', 'Username', form.username, 'username')}
            {renderInput('mail-outline', 'Email Address', form.email, 'email', false, 'email-address')}
            {renderInput('call-outline', 'Phone Number', form.phone, 'phone', false, 'phone-pad')}

            {/* Secure Password Input */}
            <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? COLORS.primary : COLORS.textMuted} style={styles.icon} />
              <TextInput 
                placeholder="Secure Password (Min 8 chars)" value={form.password} onChangeText={handlePasswordChange}
                style={styles.input} secureTextEntry={!showPass} placeholderTextColor={COLORS.borderStrong}
                onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            
            {/* Password Entropy Meter */}
            {form.password.length > 0 && (
              <View style={styles.entropyBox}>
                <View style={styles.entropyTrack}>
                  <Animated.View style={[styles.entropyFill, { width: `${(passwordStrength / 4) * 100}%`, backgroundColor: passwordStrength <= 2 ? '#E74C3C' : passwordStrength === 3 ? '#F1C40F' : '#2ECC71' }]} />
                </View>
                <Text style={[styles.entropyText, { color: passwordStrength <= 2 ? '#E74C3C' : passwordStrength === 3 ? '#F1C40F' : '#2ECC71' }]}>
                  {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                </Text>
              </View>
            )}

            {/* Seller Specific Fields */}
            {form.role === 'seller' && (
              <View style={styles.sellerSection}>
                <Text style={styles.sectionTitle}>Business Details</Text>
                
                {renderInput('business-outline', 'Shop Name', form.shopName, 'shopName')}

                <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
                  {shopPhoto ? (
                    <Image source={{ uri: shopPhoto.uri }} style={styles.photoPreview} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                      <Text style={styles.photoText}>Tap to add shop photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {renderInput('map-outline', 'Pincode', form.pincode, 'pincode', false, 'numeric', { maxLength: 6 })}

                <View style={styles.row}>
                  <View style={styles.flexHalf}>
                    <View style={styles.disabledInput}><Text style={styles.disabledText}>{form.state || 'State'}</Text></View>
                  </View>
                  <View style={{width: 12}} />
                  <View style={styles.flexHalf}>
                    <View style={styles.disabledInput}><Text style={styles.disabledText}>{form.district || 'District'}</Text></View>
                  </View>
                </View>

                {renderInput('location-outline', 'Detailed Address', form.shopAddress, 'shopAddress')}

                <TouchableOpacity style={[styles.locBtn, locating && { opacity: 0.7 }]} onPress={detectLocation} disabled={locating}>
                  <Ionicons name={coords.lat ? 'checkmark-circle' : 'locate'} size={20} color={coords.lat ? COLORS.success : COLORS.textMuted} />
                  <Text style={[styles.locBtnText, coords.lat && { color: COLORS.success }]}>
                    {locating ? 'Detecting GPS...' : coords.lat ? 'GPS Location Captured' : 'Auto Detect GPS Location'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#FFF" /> : (
                <>
                  <Text style={styles.submitBtnText}>Create Secure Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerAction}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', position: 'relative' },
  blob: { position: 'absolute', borderRadius: 300, opacity: 0.15 },
  blob1: { width: 400, height: 400, backgroundColor: '#00D4FF', top: -100, right: -150 },
  blob2: { width: 500, height: 500, backgroundColor: '#FF6B00', bottom: -150, left: -200 },
  scroll: { flexGrow: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  logoBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.md },
  card: { backgroundColor: 'rgba(19, 25, 32, 0.7)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', ...SHADOWS.xl },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 24 },
  roleWrap: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: RADIUS.lg, padding: 4, marginBottom: 24 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md },
  roleBtnActive: { backgroundColor: 'rgba(255, 107, 0, 0.1)', borderWidth: 1, borderColor: COLORS.primary },
  roleText: { color: COLORS.textMuted, fontWeight: '600', marginLeft: 8 },
  roleTextActive: { color: "#FFF" },
  row: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  flexHalf: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: RADIUS.lg, paddingHorizontal: 16, height: 56, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: 'rgba(255, 107, 0, 0.05)' },
  icon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16, height: '100%' },
  eyeBtn: { padding: 8 },
  entropyBox: { marginTop: -8, marginBottom: 16, paddingHorizontal: 4 },
  entropyTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  entropyFill: { height: '100%' },
  entropyText: { fontSize: 12, textAlign: 'right', marginTop: 4, fontWeight: '500' },
  sellerSection: { padding: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.lg, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  photoUpload: { height: 120, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', marginBottom: 16, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: COLORS.textMuted, marginTop: 8, fontSize: 13 },
  disabledInput: { height: 56, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: RADIUS.lg, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  disabledText: { color: COLORS.textMuted, fontSize: 15 },
  locBtn: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', height: 50, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  locBtnText: { color: COLORS.textMuted, marginLeft: 8, fontWeight: '600' },
  submitBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...SHADOWS.md },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 12 },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  footerAction: { color: COLORS.primary, fontSize: 14, fontWeight: '700' }
});
