import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { userAPI } from '../utils/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = enter username, 2 = enter token + new pass
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [tokenFromAPI, setTokenFromAPI] = useState(''); // shown on step 2

  const handleRequestToken = async () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your username or email.');
      return;
    }
    setLoading(true);
    try {
      const res = await userAPI.forgotPassword(identifier.trim());
      // Token is returned directly (in production this would be emailed)
      setTokenFromAPI(res.data.reset_token || '');
      setResetToken(res.data.reset_token || '');
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not process request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim() || !newPassword.trim()) {
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
      await userAPI.resetPassword(resetToken.trim(), newPassword);
      Alert.alert('Success! 🎉', 'Your password has been reset. Please log in with your new password.', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Invalid or expired token. Please try again.');
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

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your username or email to get a reset token.'
            : 'Enter the reset token and your new password.'}
        </Text>

        {/* Step 1: Enter identifier */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Username or Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your username or email"
                placeholderTextColor={COLORS.textMuted}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestToken} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.primaryBtnText}>Get Reset Token</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Enter token + new password */}
        {step === 2 && (
          <View style={styles.card}>
            {tokenFromAPI ? (
              <View style={styles.tokenBox}>
                <Text style={styles.tokenLabel}>Your Reset Token:</Text>
                <Text style={styles.tokenValue} selectable>{tokenFromAPI}</Text>
                <Text style={styles.tokenNote}>Copy this token (in production it would be emailed to you)</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Reset Token</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Paste your reset token"
                placeholderTextColor={COLORS.textMuted}
                value={resetToken}
                onChangeText={setResetToken}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

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

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
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

            <TouchableOpacity style={styles.linkBtn} onPress={() => setStep(1)}>
              <Text style={styles.linkText}>← Go back</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>Remember password? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingTop: 60, flexGrow: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  iconEmoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.md },
  label: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, marginBottom: 4 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 12 },
  eyeBtn: { padding: 8 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingVertical: 14, marginTop: 20, ...SHADOWS.brand },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  tokenBox: { backgroundColor: 'rgba(255,182,39,0.08)', borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: 'rgba(255,182,39,0.3)', marginBottom: 12 },
  tokenLabel: { fontSize: 11, fontWeight: '700', color: COLORS.secondary, textTransform: 'uppercase', marginBottom: 6 },
  tokenValue: { fontSize: 13, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 4 },
  tokenNote: { fontSize: 11, color: COLORS.textMuted },
  linkBtn: { alignItems: 'center', paddingVertical: 12 },
  linkText: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { alignItems: 'center', marginTop: 24 },
  loginLinkText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
