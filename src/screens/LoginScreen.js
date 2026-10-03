import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Animated, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '../config';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation, route }) {
  const { loginWithPhoneOTP, loginWithEmailOTP } = useAuth();
  
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  
  const recaptchaVerifier = React.useRef(null);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, [step]);

  const isEmail = identifier.includes('@');

  const handleSendOTP = async () => {
    if (!identifier) return Alert.alert('Error', 'Please enter your phone number or email');
    
    if (isEmail) {
      if (!/^\S+@\S+\.\S+$/.test(identifier)) return Alert.alert('Error', 'Please enter a valid email address');
    } else {
      if (identifier.length < 10) return Alert.alert('Error', 'Please enter a valid 10-digit phone number');
    }

    setLoading(true);
    try {
      if (!isEmail) {
        const phoneProvider = new PhoneAuthProvider(auth);
        const vid = await phoneProvider.verifyPhoneNumber(+91+identifier, recaptchaVerifier.current);
        setVerificationId(vid);
      } else {
        await authAPI.sendPhoneOtp(null, identifier);
      }
      setStep(2);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Please enter a 6-digit OTP');
    
    setLoading(true);
    try {
      if (!isEmail) {
        const credential = PhoneAuthProvider.credential(verificationId, otp);
        const result = await signInWithCredential(auth, credential);
        const idToken = await result.user.getIdToken();
        await loginWithPhoneOTP(idToken, null, null);
      } else {
        await loginWithPhoneOTP(null, otp, identifier);
      }
      
      const from = route.params?.from || 'HomeMain';
      navigation.navigate(from);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ffffff', '#fff5f0']} style={StyleSheet.absoluteFillObject} />
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={auth.app.options} />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/icon.png')} style={styles.logo} />
              <Text style={styles.subtitle}>Welcome back! Sign in to continue your journey.</Text>
            </View>

            {step === 1 ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone Number or Email</Text>
                  <View style={[styles.inputContainer, focusedInput === 'id' && styles.inputFocused]}>
                    <Ionicons name="person-outline" size={20} color={focusedInput === 'id' ? '#FF6B00' : COLORS.textMuted} style={styles.icon} />
                    <TextInput 
                      placeholder="Enter 10-digit number or email" 
                      value={identifier} 
                      onChangeText={setIdentifier} 
                      style={styles.input} 
                      autoCapitalize="none" 
                      placeholderTextColor={COLORS.borderStrong}
                      onFocus={() => setFocusedInput('id')} 
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                  <Text style={styles.hint}>We will send an OTP to verify your identity.</Text>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={loading} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Sending OTP...' : 'Get OTP'}</Text>
                  {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footerLink}>
                  <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerAction}>Sign Up</Text></Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.verifyHeader}>
                  <Ionicons name="shield-checkmark" size={48} color="#FF6B00" />
                  <Text style={styles.verifyTitle}>Verify your details</Text>
                  <Text style={styles.verifyDesc}>We've sent a 6-digit code to {identifier}</Text>
                  <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.changeLink}>Change Details</Text></TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput 
                    placeholder="• • • • • •" 
                    value={otp} 
                    onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0,6))} 
                    style={styles.otpInput} 
                    keyboardType="number-pad" 
                    placeholderTextColor={COLORS.borderStrong}
                    maxLength={6}
                    autoFocus
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOTP} disabled={loading || otp.length < 6} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Verifying...' : 'Verify & Login'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleSendOTP} style={styles.footerLink}>
                  <Text style={styles.footerAction}><Ionicons name="refresh" size={14}/> Resend OTP</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 10, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 107, 53, 0.2)', shadowColor: 'rgba(255, 107, 53, 0.25)', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 1, shadowRadius: 40, elevation: 10 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 70, height: 70, borderRadius: 16, marginBottom: 16 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 10 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1.5, borderColor: 'transparent' },
  inputFocused: { borderColor: '#FF6B00', backgroundColor: '#fff' },
  icon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.text, fontSize: 16, height: '100%' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  primaryBtn: { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6B00', ...SHADOWS.md },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 },
  footerLink: { marginTop: 24, alignItems: 'center' },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  footerAction: { color: '#FF6B00', fontSize: 14, fontWeight: '700' },
  verifyHeader: { alignItems: 'center', marginBottom: 24 },
  verifyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12, marginBottom: 4 },
  verifyDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 8 },
  changeLink: { color: '#FF6B00', fontSize: 14, fontWeight: '600' },
  otpInput: { backgroundColor: '#f8f9fa', borderRadius: 12, height: 60, textAlign: 'center', fontSize: 24, letterSpacing: 10, fontWeight: '700', color: COLORS.text, borderWidth: 1, borderColor: COLORS.border }
});
