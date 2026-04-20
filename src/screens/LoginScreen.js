import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions, Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const { login, loading } = useAuth();
  const passwordRef = useRef(null);

  // -- Hyper Unique Animation Engines --
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoRot = useRef(new Animated.Value(0)).current;
  const blobShape = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Render Pipeline
  useEffect(() => {
    // 1. Enter the Main Card
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();

    // 2. Ambient Liquid Background Morphing
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobShape, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(blobShape, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    ).start();

    // 3. Logo 3D Flip
    Animated.loop(
      Animated.timing(logoRot, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const triggerErrorShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleLogin = async () => {
    if (!username || !password) { triggerErrorShake(); Alert.alert('Error', 'Please fill all fields'); return; }
    const result = await login(username, password);
    if (!result.success) {
      triggerErrorShake();
      Alert.alert('Login Failed', result.error);
    }
  };

  // Interpolations
  const logoRotation = logoRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const blobBorderRadius = blobShape.interpolate({ inputRange: [0, 1], outputRange: [200, 50] });

  return (
    <SafeAreaView style={styles.container}>
      {/* Hyper-Animated Liquid Background Matrices */}
      <Animated.View style={[styles.liquidBlob, { 
        backgroundColor: '#FF6B00', top: -100, left: -50,
        transform: [{ scaleX: blobShape.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
        borderBottomRightRadius: blobBorderRadius 
      }]} />
      <Animated.View style={[styles.liquidBlob, { 
        backgroundColor: '#5521FF', bottom: -120, right: -80,
        transform: [{ scaleY: blobShape.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
        borderTopLeftRadius: blobBorderRadius 
      }]} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <Animated.View style={[styles.card, { 
            opacity: cardOpacity, 
            transform: [
              { scale: cardScale }, 
              { translateX: shakeAnim },
              { perspective: 1000 }
            ] 
          }]}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.logoWrap}>
              <Animated.View style={[styles.hologramRing, { transform: [{ rotate: logoRotation }] }]} />
              <View style={styles.logoBox}>
                <Ionicons name="flash" size={36} color="#FFF" />
              </View>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Unlock your local marketplace</Text>

            {/* Username & Password — plain Views for correct touch targeting */}
            <View style={[styles.inputContainer, focusedInput === 'username' && styles.inputFocused]}>
              <Ionicons name="person" size={20} color={focusedInput === 'username' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
              <TextInput 
                placeholder="Username" value={username} onChangeText={setUsername} 
                style={styles.input} autoCapitalize="none" placeholderTextColor={COLORS.borderStrong}
                onFocus={() => setFocusedInput('username')} onBlur={() => setFocusedInput(null)}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
              <Ionicons name="finger-print" size={20} color={focusedInput === 'password' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
              <TextInput 
                ref={passwordRef}
                placeholder="Secure Password" value={password} onChangeText={setPassword} 
                style={styles.input} secureTextEntry={!showPass} placeholderTextColor={COLORS.borderStrong}
                onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={22} color={showPass ? '#FF6B00' : COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <View style={styles.btnHologram} />
              <Text style={styles.loginBtnText}>{loading ? 'Authenticating...' : 'Sign In Now'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
            </TouchableOpacity>

            <Animated.View style={[styles.footer, { opacity: cardOpacity }]}>
              <Text style={styles.footerText}>New to IndianLocalStore? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerAction}>Join Free</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070a12', position: 'relative' },
  liquidBlob: { position: 'absolute', width: 350, height: 350, opacity: 0.25 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  card: { backgroundColor: 'rgba(20, 25, 34, 0.65)', borderRadius: 32, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', ...SHADOWS.xl },
  headerRow: { position: 'absolute', top: 24, left: 24, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 30, marginTop: 40 },
  hologramRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#5521FF', borderStyle: 'dashed', opacity: 0.5 },
  logoBox: { width: 70, height: 70, borderRadius: 24, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: '#8b9bb4', textAlign: 'center', marginBottom: 36, letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.05)' },
  inputFocused: { borderColor: '#FF6B00', backgroundColor: 'rgba(255, 107, 0, 0.05)', transform: [{ scale: 1.02 }] },
  icon: { marginRight: 14 },
  input: { flex: 1, color: '#FFF', fontSize: 17, height: '100%', fontWeight: '500' },
  eyeBtn: { padding: 8 },
  loginBtn: { height: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, backgroundColor: '#FF6B00', overflow: 'hidden' },
  btnHologram: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.1)' },
  loginBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#8b9bb4', fontSize: 15 },
  footerAction: { color: '#00D4FF', fontSize: 15, fontWeight: '800' }
});
