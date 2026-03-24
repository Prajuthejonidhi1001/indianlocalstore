import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../utils/api';

export default function RegisterScreen({ navigation }) {
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  
  // Form State matching Web exactly
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'customer',
    // Seller Fields
    shopName: '',
    shopAddress: '',
    pincode: '',
    state: '',
    district: '',
    taluk: '',
  });

  const [shopPhoto, setShopPhoto] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [locating, setLocating] = useState(false);

  // Pincode Auto-lookup (Same as Web)
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
            
            setForm(f => ({ 
              ...f, 
              state: offices[0].State, 
              district: offices[0].District, 
              taluk: uniqueTaluks[0] || offices[0].District 
            }));
            setTaluks(uniqueTaluks.length > 0 ? uniqueTaluks : [offices[0].District]);
          } else {
            setForm(f => ({ ...f, state: '', district: '', taluk: '' }));
            setTaluks([]);
          }
        } catch (e) {
          console.error('Pincode fetch error:', e);
        } finally {
          setFetchingPin(false);
        }
      }
    };
    fetchPinData();
  }, [form.pincode]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'We need access to your gallery');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setShopPhoto(result.assets[0]);
    }
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Error', 'Location permission denied');

      let loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Alert.alert('Success', 'Shop location captured accurately!');
    } catch (e) {
      Alert.alert('Error', 'Unable to detect location');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    const required = ['username', 'email', 'password', 'first_name'];
    for (const f of required) {
      if (!form[f]) return Alert.alert('Required', `${f.replace('_', ' ')} is missing`);
    }

    if (form.role === 'seller' && (!form.shopName || !form.pincode || !form.shopAddress)) {
      return Alert.alert('Missing Details', 'Please fill all required business details');
    }

    setLoading(true);
    try {
      const userData = {
        username: form.username,
        email: form.email,
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        role: form.role
      };

      const regRes = await register(userData);
      if (!regRes.success) throw new Error(regRes.error);

      if (form.role === 'seller') {
        // Auto-login to create shop
        await login(form.username, form.password);
        
        const shopData = new FormData();
        shopData.append('name', form.shopName);
        shopData.append('email', form.email);
        shopData.append('phone', form.phone);
        shopData.append('pincode', form.pincode);
        shopData.append('address', form.shopAddress);
        shopData.append('city', form.district);
        shopData.append('state', form.state);
        shopData.append('latitude', coords.lat || 20.5937);
        shopData.append('longitude', coords.lng || 78.9629);
        shopData.append('description', `Quality local store in ${form.taluk}, ${form.district}`);
        
        if (shopPhoto) {
          const uri = shopPhoto.uri;
          const name = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(name);
          const type = match ? `image/${match[1]}` : `image`;
          shopData.append('logo', { uri, name, type });
        }

        const shopRes = await shopAPI.createShop(shopData);
        Alert.alert('Success', 'Account & Shop created! Welcome aboard.');
        navigation.navigate('Main'); // Navigate to home
      } else {
        Alert.alert('Success', 'Account created! Please log in.');
        navigation.navigate('Login');
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join thousands of local shoppers & sellers</Text>

        {/* Role Selector */}
        <View style={styles.roleRow}>
          <TouchableOpacity 
            style={[styles.roleBtn, form.role === 'customer' && styles.roleBtnActive]} 
            onPress={() => setForm({...form, role: 'customer'})}
          >
            <Ionicons name="person" size={18} color={form.role === 'customer' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.roleText, form.role === 'customer' && styles.roleTextActive]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, form.role === 'seller' && styles.roleBtnActive]} 
            onPress={() => setForm({...form, role: 'seller'})}
          >
            <Ionicons name="storefront" size={18} color={form.role === 'seller' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.roleText, form.role === 'seller' && styles.roleTextActive]}>Seller</Text>
          </TouchableOpacity>
        </View>

        {/* User Details */}
        <View style={styles.row}>
          <View style={[styles.inputWrap, { flex: 1, marginRight: 10 }]}>
            <TextInput 
              placeholder="First Name" 
              value={form.first_name} 
              onChangeText={t => setForm({...form, first_name: t})} 
              style={styles.input} 
              placeholderTextColor={COLORS.textMuted} 
            />
          </View>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <TextInput 
              placeholder="Last Name" 
              value={form.last_name} 
              onChangeText={t => setForm({...form, last_name: t})} 
              style={styles.input} 
              placeholderTextColor={COLORS.textMuted} 
            />
          </View>
        </View>

        <View style={styles.inputWrap}>
          <TextInput 
            placeholder="Username *" 
            value={form.username} 
            onChangeText={t => setForm({...form, username: t})} 
            style={styles.input} 
            autoCapitalize="none" 
            placeholderTextColor={COLORS.textMuted} 
          />
        </View>

        <View style={styles.inputWrap}>
          <TextInput 
            placeholder="Email address *" 
            value={form.email} 
            onChangeText={t => setForm({...form, email: t})} 
            style={styles.input} 
            keyboardType="email-address" 
            autoCapitalize="none" 
            placeholderTextColor={COLORS.textMuted} 
          />
        </View>

        <View style={styles.inputWrap}>
          <TextInput 
            placeholder="Phone number" 
            value={form.phone} 
            onChangeText={t => setForm({...form, phone: t})} 
            style={styles.input} 
            keyboardType="phone-pad" 
            placeholderTextColor={COLORS.textMuted} 
          />
        </View>

        {/* Seller Business Details */}
        {form.role === 'seller' && (
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Business Details</Text>
            
            <View style={styles.inputWrap}>
              <TextInput 
                placeholder="Shop Name *" 
                value={form.shopName} 
                onChangeText={t => setForm({...form, shopName: t})} 
                style={styles.input} 
                placeholderTextColor={COLORS.textMuted} 
              />
            </View>

            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              {shopPhoto ? (
                <Image source={{ uri: shopPhoto.uri }} style={styles.pickedImage} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.imageBtnText}>Upload Shop Photo</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={[styles.inputWrap, { flex: 1, marginRight: 10 }]}>
                {fetchingPin && <ActivityIndicator size="small" color={COLORS.primary} style={styles.pinLoading} />}
                <TextInput 
                  placeholder="Pincode *" 
                  value={form.pincode} 
                  onChangeText={t => setForm({...form, pincode: t})} 
                  style={styles.input} 
                  maxLength={6}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.textMuted} 
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <TextInput 
                  placeholder="State" 
                  value={form.state} 
                  editable={false} 
                  style={styles.input} 
                  placeholderTextColor={COLORS.textMuted} 
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrap, { flex: 1, marginRight: 10, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <TextInput 
                  placeholder="District" 
                  value={form.district} 
                  editable={false} 
                  style={styles.input} 
                  placeholderTextColor={COLORS.textMuted} 
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <TextInput 
                  placeholder="Taluk" 
                  value={form.taluk} 
                  onChangeText={t => setForm({...form, taluk: t})} 
                  style={styles.input} 
                  placeholderTextColor={COLORS.textMuted} 
                />
              </View>
            </View>

            <View style={[styles.inputWrap, { minHeight: 100, alignItems: 'flex-start' }]}>
              <TextInput 
                placeholder="Shop address *" 
                value={form.shopAddress} 
                onChangeText={t => setForm({...form, shopAddress: t})} 
                style={[styles.input, { textAlignVertical: 'top' }]} 
                multiline
                placeholderTextColor={COLORS.textMuted} 
              />
            </View>

            <TouchableOpacity style={styles.gpsBtn} onPress={detectLocation} disabled={locating}>
              <Ionicons name="pin" size={18} color={coords.lat ? COLORS.success : COLORS.text} />
              <Text style={styles.gpsBtnText}>{locating ? 'Detecting...' : coords.lat ? 'Location Captured ✅' : 'Detect Shop Location'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Password */}
        <View style={[styles.inputWrap, { marginTop: 10 }]}>
          <TextInput 
            placeholder="Password *" 
            value={form.password} 
            onChangeText={t => setForm({...form, password: t})} 
            style={styles.input} 
            secureTextEntry={!showPw} 
            placeholderTextColor={COLORS.textMuted} 
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
             <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Create Account</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 40 },
  backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 25 },
  
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  roleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  roleText: { fontSize: 15, fontWeight: '700', color: COLORS.textMuted },
  roleTextActive: { color: '#fff' },

  row: { flexDirection: 'row' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 15, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: COLORS.text },
  eyeBtn: { padding: 10 },
  pinLoading: { marginRight: 10 },

  sellerSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  
  imageBtn: { height: 120, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 15, backgroundColor: 'rgba(255,107,53,0.02)' },
  pickedImage: { width: '100%', height: '100%', borderRadius: 15 },
  imageBtnText: { color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  
  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  gpsBtnText: { color: COLORS.text, fontWeight: '600' },

  registerBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 25 },
  registerBtnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  loginText: { textAlign: 'center', fontSize: 14, color: COLORS.textMuted },
  loginLink: { color: COLORS.primary, fontWeight: '700' },
});
