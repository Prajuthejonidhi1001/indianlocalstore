import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions, Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import config, { auth } from '../config';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const recaptchaVerifier = useRef(null);
  const { loginWithPhoneOTP } = useAuth();

  // Animations
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoRot = useRef(new Animated.Value(0)).current;
  const blobShape = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blobShape, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(blobShape, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    ).start();

    Animated.loop(
      Animated.timing(logoRot, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const triggerErrorShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) { 
      triggerErrorShake(); 
      Alert.alert('Error', 'Please enter a valid 10-digit phone number'); 
      return; 
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      triggerErrorShake();
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const phoneNumber = `+91${phone}`;
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);

      if (email) {
        await authAPI.sendPhoneOtp(phoneNumber, email);
      }

      setStep(2);
      setResendCooldown(30);
      Alert.alert('OTP Sent', email ? 'OTPs sent to phone and email!' : 'OTP sent to your phone!');
    } catch (err) {
      console.error("FIREBASE ERROR:", err);
      Alert.alert('Error', err.message || 'Failed to send OTP. Try again.');
      triggerErrorShake();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (phoneOtp.length !== 6) {
      triggerErrorShake();
      Alert.alert('Error', 'Please enter a valid 6-digit phone OTP');
      return;
    }
    if (email && emailOtp.length !== 6) {
      triggerErrorShake();
      Alert.alert('Error', 'Please enter a valid 6-digit email OTP');
      return;
    }

    setLoading(true);
    try {
      // Create credential from verificationId and OTP
      const credential = PhoneAuthProvider.credential(verificationId, phoneOtp);
      // Wait, we need the firebase idToken
      // Unfortunately we must sign in to get the token, but we are using Firebase Auth
      // In expo-firebase-recaptcha flow, usually you call auth.signInWithCredential(credential)
      // Wait, React Native Firebase v9 uses `signInWithCredential`
      const { signInWithCredential } = require('firebase/auth');
      const result = await signInWithCredential(auth, credential);
      const idToken = await result.user.getIdToken();

      const res = await loginWithPhoneOTP(idToken, emailOtp);
      
      if (!res.success) {
        triggerErrorShake();
        Alert.alert('Verification Failed', res.error);
      } else {
        Alert.alert('Success', res.is_new_user ? 'Account created!' : 'Logged in!');
      }
    } catch (err) {
      console.error(err);
      triggerErrorShake();
      Alert.alert('Error', 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const logoRotation = logoRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const blobBorderRadius = blobShape.interpolate({ inputRange: [0, 1], outputRange: [200, 50] });

  return (
    <SafeAreaView style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={config.firebaseConfig}
        attemptInvisibleVerification={true}
      />
      
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
          <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            
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

            <Text style={styles.title}>{step === 1 ? 'Welcome Back' : 'Verify Identity'}</Text>
            <Text style={styles.subtitle}>{step === 1 ? 'Sign in with your phone number' : 'Enter the code sent to your phone'}</Text>

            {step === 1 ? (
              <>
                <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputFocused]}>
                  <Ionicons name="call" size={20} color={focusedInput === 'phone' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
                  <Text style={{color: COLORS.text, fontSize: 17, marginRight: 8, fontWeight: '500'}}>+91</Text>
                  <TextInput 
                    placeholder="10-digit number" value={phone} onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0,10))} 
                    style={styles.input} keyboardType="phone-pad" placeholderTextColor={COLORS.borderStrong}
                    onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)}
                  />
                </View>

                <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputFocused]}>
                  <Ionicons name="mail" size={20} color={focusedInput === 'email' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
                  <TextInput 
                    placeholder="Email (Optional for extra security)" value={email} onChangeText={setEmail} 
                    style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.borderStrong}
                    onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                  />
                </View>

                <TouchableOpacity style={styles.loginBtn} onPress={handleSendOTP} disabled={loading} activeOpacity={0.85}>
                  <View style={styles.btnHologram} />
                  <Text style={styles.loginBtnText}>{loading ? 'Sending OTP...' : 'Get OTP'}</Text>
                  {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.inputContainer, focusedInput === 'phoneOtp' && styles.inputFocused]}>
                  <Ionicons name="key" size={20} color={focusedInput === 'phoneOtp' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
                  <TextInput 
                    placeholder="Phone OTP (6 digits)" value={phoneOtp} onChangeText={t => setPhoneOtp(t.replace(/\D/g, '').slice(0,6))} 
                    style={[styles.input, {letterSpacing: 8, fontSize: 20}]} keyboardType="number-pad" placeholderTextColor={COLORS.borderStrong}
                    onFocus={() => setFocusedInput('phoneOtp')} onBlur={() => setFocusedInput(null)}
                    maxLength={6}
                  />
                </View>

                {email ? (
                  <View style={[styles.inputContainer, focusedInput === 'emailOtp' && styles.inputFocused]}>
                    <Ionicons name="mail" size={20} color={focusedInput === 'emailOtp' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
                    <TextInput 
                      placeholder="Email OTP (6 digits)" value={emailOtp} onChangeText={t => setEmailOtp(t.replace(/\D/g, '').slice(0,6))} 
                      style={[styles.input, {letterSpacing: 8, fontSize: 20}]} keyboardType="number-pad" placeholderTextColor={COLORS.borderStrong}
                      onFocus={() => setFocusedInput('emailOtp')} onBlur={() => setFocusedInput(null)}
                      maxLength={6}
                    />
                  </View>
                ) : null}

                <TouchableOpacity style={styles.loginBtn} onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.85}>
                  <View style={styles.btnHologram} />
                  <Text style={styles.loginBtnText}>{loading ? 'Verifying...' : 'Verify & Login'}</Text>
                  {!loading && <Ionicons name="checkmark-circle" size={20} color="#FFF" />}
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setStep(1)} style={{marginTop: 20, alignItems: 'center'}}>
                  <Text style={styles.footerAction}>Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}

            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, position: 'relative' },
  liquidBlob: { position: 'absolute', width: 350, height: 350, opacity: 0.25 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  card: { backgroundColor: COLORS.glass, borderRadius: 32, padding: 28, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.xl },
  headerRow: { position: 'absolute', top: 24, left: 24, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 30, marginTop: 40 },
  hologramRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#5521FF', borderStyle: 'dashed', opacity: 0.5 },
  logoBox: { width: 70, height: 70, borderRadius: 24, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginBottom: 36, letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.border },
  inputFocused: { borderColor: '#FF6B00', backgroundColor: 'rgba(255, 107, 0, 0.05)' },
  icon: { marginRight: 14 },
  input: { flex: 1, color: COLORS.text, fontSize: 17, height: '100%', fontWeight: '500' },
  loginBtn: { height: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, backgroundColor: '#FF6B00', overflow: 'hidden' },
  btnHologram: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.1)' },
  loginBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 },
  footerAction: { color: '#00D4FF', fontSize: 15, fontWeight: '800' },
});
