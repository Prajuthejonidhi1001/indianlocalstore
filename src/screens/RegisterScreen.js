import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Image, ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions, Vibration
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
  
  // -- Hyper Unique Animation Engines --
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const blobShape = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
    // 1. Staggered Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(formSlide, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true })
        ])
      ])
    ]).start();

    // 2. Background Morphing
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobShape, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(blobShape, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    ).start();
  }, []);

  const triggerErrorShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
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
    if (status !== 'granted') { triggerErrorShake(); Alert.alert('Permission Denied', 'We need access to your gallery'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setShopPhoto(result.assets[0]);
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { triggerErrorShake(); Alert.alert('Permission Denied', 'Location is needed for sellers'); setLocating(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Alert.alert('Success', 'Shop location detected!');
    } catch {
      triggerErrorShake();
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLocating(false);
    }
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.first_name || !form.last_name || !form.phone || !form.password) {
      triggerErrorShake();
      return Alert.alert('Missing Fields', 'Please fill all basic details.');
    }
    if (form.password.length < 8) {
      triggerErrorShake();
      return Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
    }
    if (form.role === 'seller' && (!form.shopName || !form.shopAddress || !form.pincode || !form.state)) {
      triggerErrorShake();
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
        triggerErrorShake();
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
      triggerErrorShake();
      Alert.alert('Error', 'Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon, placeholder, value, key, secure = false, type = 'default', extraProps = {}) => (
    <View style={[styles.inputContainer, focusedInput === key && styles.inputFocused]}>
      <Ionicons name={icon} size={20} color={focusedInput === key ? '#00D4FF' : COLORS.textMuted} style={styles.icon} />
      <TextInput 
        placeholder={placeholder} value={value} onChangeText={(t) => setForm({ ...form, [key]: t })}
        style={styles.input} secureTextEntry={secure && !showPass} keyboardType={type}
        placeholderTextColor={COLORS.borderStrong} autoCapitalize="none"
        onFocus={() => setFocusedInput(key)} onBlur={() => setFocusedInput(null)}
        {...extraProps}
      />
      {secure && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
          <Ionicons name={showPass ? 'eye-off' : 'eye'} size={22} color={showPass ? '#00D4FF' : COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.liquidBlob, { 
        backgroundColor: '#00D4FF', top: -150, right: -100,
        transform: [{ scaleY: blobShape.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
        borderBottomLeftRadius: blobShape.interpolate({ inputRange: [0, 1], outputRange: [200, 50] }) 
      }]} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }, { translateX: shakeAnim }, { perspective: 1000 }] 
          }]}>
            
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.logoBox}><Ionicons name="people" size={22} color="#FFF" /></View>
            </View>

            <Text style={styles.title}>Join Us</Text>
            <Text style={styles.subtitle}>Shop & sell locally, seamlessly.</Text>

            <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
              {/* Role Selection */}
              <View style={styles.roleWrap}>
                <TouchableOpacity style={[styles.roleBtn, form.role === 'customer' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'customer' })}>
                  <Ionicons name="person" size={18} color={form.role === 'customer' ? '#00D4FF' : COLORS.textMuted} />
                  <Text style={[styles.roleText, form.role === 'customer' && styles.roleTextActive]}>Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roleBtn, form.role === 'seller' && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: 'seller' })}>
                  <Ionicons name="cart" size={18} color={form.role === 'seller' ? '#00D4FF' : COLORS.textMuted} />
                  <Text style={[styles.roleText, form.role === 'seller' && styles.roleTextActive]}>Seller</Text>
                </TouchableOpacity>
              </View>

              {/* Basic Info */}
              <View style={styles.row}>
                <View style={styles.flexHalf}>{renderInput('person', 'First Name', form.first_name, 'first_name')}</View>
                <View style={{width: 12}} />
                <View style={styles.flexHalf}>{renderInput('person', 'Last Name', form.last_name, 'last_name')}</View>
              </View>
              {renderInput('at', 'Username', form.username, 'username')}
              {renderInput('mail', 'Email Address', form.email, 'email', false, 'email-address')}
              {renderInput('call', 'Phone Number', form.phone, 'phone', false, 'phone-pad')}

              {/* Secure Password Input */}
              <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
                <Ionicons name="finger-print" size={20} color={focusedInput === 'password' ? '#00D4FF' : COLORS.textMuted} style={styles.icon} />
                <TextInput 
                  placeholder="Password (Min 8 chars)" value={form.password} onChangeText={handlePasswordChange}
                  style={styles.input} secureTextEntry={!showPass} placeholderTextColor={COLORS.borderStrong}
                  onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={22} color={showPass ? '#00D4FF' : COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              {form.password.length > 0 && (
                <View style={styles.entropyBox}>
                  <View style={styles.entropyTrack}>
                    <Animated.View style={[styles.entropyFill, { width: `${(passwordStrength / 4) * 100}%`, backgroundColor: passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71' }]} />
                  </View>
                  <Text style={[styles.entropyText, { color: passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71' }]}>
                    {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                  </Text>
                </View>
              )}

              {/* Seller Specific Fields */}
              {form.role === 'seller' && (
                <View style={styles.sellerSection}>
                  <Text style={styles.sectionTitle}>Business Details</Text>
                  
                  {renderInput('business', 'Shop Name', form.shopName, 'shopName')}

                  <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
                    {shopPhoto ? (
                      <Image source={{ uri: shopPhoto.uri }} style={styles.photoPreview} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons name="image" size={36} color={COLORS.textMuted} />
                        <Text style={styles.photoText}>Tap to upload shop logo</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {renderInput('map', 'Pincode', form.pincode, 'pincode', false, 'numeric', { maxLength: 6 })}

                  <View style={styles.row}>
                    <View style={styles.flexHalf}>
                      <View style={styles.disabledInput}><Text style={styles.disabledText}>{form.state || 'State'}</Text></View>
                    </View>
                    <View style={{width: 12}} />
                    <View style={styles.flexHalf}>
                      <View style={styles.disabledInput}><Text style={styles.disabledText}>{form.district || 'District'}</Text></View>
                    </View>
                  </View>

                  {renderInput('navigate', 'Detailed Address', form.shopAddress, 'shopAddress')}

                  <TouchableOpacity style={[styles.locBtn, locating && { opacity: 0.7 }]} onPress={detectLocation} disabled={locating}>
                    <Ionicons name={coords.lat ? 'checkmark-circle' : 'locate'} size={20} color={coords.lat ? COLORS.success : COLORS.textMuted} />
                    <Text style={[styles.locBtnText, coords.lat && { color: COLORS.success }]}>
                      {locating ? 'Detecting GPS...' : coords.lat ? 'GPS Location Captured' : 'Auto Detect GPS Location'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
                <View style={styles.btnHologram} />
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

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070a12', position: 'relative' },
  liquidBlob: { position: 'absolute', width: 400, height: 400, opacity: 0.15 },
  scroll: { flexGrow: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#00D4FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  card: { backgroundColor: 'rgba(20, 25, 34, 0.65)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', ...SHADOWS.xl },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: '#8b9bb4', marginBottom: 28 },
  roleWrap: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 6, marginBottom: 28 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  roleBtnActive: { backgroundColor: 'rgba(0, 212, 255, 0.1)', borderWidth: 1.5, borderColor: '#00D4FF' },
  roleText: { color: COLORS.textMuted, fontWeight: '700', marginLeft: 8, fontSize: 15 },
  roleTextActive: { color: "#FFF" },
  row: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  flexHalf: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.05)' },
  inputFocused: { borderColor: '#00D4FF', backgroundColor: 'rgba(0, 212, 255, 0.05)', transform: [{ scale: 1.02 }] },
  icon: { marginRight: 14 },
  input: { flex: 1, color: '#FFF', fontSize: 16, height: '100%', fontWeight: '500' },
  eyeBtn: { padding: 8 },
  entropyBox: { marginTop: -6, marginBottom: 20, paddingHorizontal: 4 },
  entropyTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 3, overflow: 'hidden' },
  entropyFill: { height: '100%' },
  entropyText: { fontSize: 13, textAlign: 'right', marginTop: 6, fontWeight: '700' },
  sellerSection: { padding: 20, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#00D4FF', fontSize: 17, fontWeight: '800', marginBottom: 20 },
  photoUpload: { height: 130, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', marginBottom: 20, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: '#8b9bb4', marginTop: 10, fontSize: 14, fontWeight: '600' },
  disabledInput: { height: 60, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  disabledText: { color: '#8b9bb4', fontSize: 16, fontWeight: '600' },
  locBtn: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  locBtnText: { color: '#FFF', marginLeft: 10, fontWeight: '700', fontSize: 15 },
  submitBtn: { height: 64, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00D4FF', overflow: 'hidden', marginTop: 10 },
  btnHologram: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.2)' },
  submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '900', marginRight: 10, letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, paddingBottom: 20 },
  footerText: { color: '#8b9bb4', fontSize: 15 },
  footerAction: { color: '#FF6B00', fontSize: 15, fontWeight: '800' }
});
