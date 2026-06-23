import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import axios from 'axios';

const API_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api'; // Or use your config

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp + new pass
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  const handleRequestOTP = async () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users/forgot_password/`, { email: identifier.trim() });
      setStep(2);
      setResendCooldown(60);
      Alert.alert('OTP Sent', 'Check your email for the 6-digit verification code.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not process request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post(`${API_URL}/users/forgot_password/`, { email: identifier.trim() });
      setResendCooldown(60);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users/reset_password/`, {
        email: identifier.trim(),
        otp: otp.trim(),
        new_password: newPassword
      });
      Alert.alert('Success! 🎉', 'Your password has been reset. Please log in with your new password.', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Text style={styles.iconEmoji}>🔐</Text>
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your email to get a verification code.'
            : 'Enter the 6-digit OTP sent to your email and your new password.'}
        </Text>

        {/* Step 1: Enter email */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textMuted}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestOTP} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.primaryBtnText}>Get OTP</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Enter OTP + new password */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '700' }}>Verification Code (OTP)</Text>
            <View style={[styles.inputWrap, { justifyContent: 'center', paddingHorizontal: 0 }]}>
              <TextInput
                style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8, paddingVertical: 15 }]}
                placeholder="------"
                placeholderTextColor={COLORS.border}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity 
              style={{ alignSelf: 'center', marginVertical: 10 }} 
              onPress={handleResendOTP} 
              disabled={resendCooldown > 0}
            >
              <Text style={{ color: resendCooldown > 0 ? COLORS.textMuted : COLORS.primary, fontWeight: '600' }}>
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={COLORS.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, marginBottom: 12, lineHeight: 16 }}>
              Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
            </Text>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Re-enter new password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.primaryBtnText}>Reset Password</Text><Ionicons name="checkmark" size={18} color="#fff" /></>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
              <Text style={styles.secondaryBtnText}>← Back to Email</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 25, paddingTop: 60, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', padding: 8, backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 20, ...SHADOWS.sm },
  iconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,107,53,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  iconEmoji: { fontSize: 32 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginBottom: 30, paddingHorizontal: 10, lineHeight: 22 },
  card: { width: '100%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.md },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8, marginTop: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: COLORS.text, fontSize: 15 },
  eyeBtn: { padding: 10 },
  primaryBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', height: 52, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginTop: 25, ...SHADOWS.md },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },
  secondaryBtn: { marginTop: 15, alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' }
});
