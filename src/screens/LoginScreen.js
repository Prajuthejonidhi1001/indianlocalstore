import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    const success = login(email, password);
    if (success) navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
      </TouchableOpacity>
      <Text style={styles.title}>Welcome Back! 🛒</Text>
      <Text style={styles.subtitle}>Login to your Indian Local Store account</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput placeholder="Email address" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textMuted} />
      </View>
      <View style={styles.inputWrap}>
        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry={!showPass} placeholderTextColor={COLORS.textMuted} />
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
          <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerLink}>Register</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 24, paddingTop: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.gray, marginBottom: 32 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGray, borderRadius: 14, marginBottom: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.dark },
  eyeBtn: { padding: 4 },
  loginBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  registerText: { textAlign: 'center', fontSize: 14, color: COLORS.gray },
  registerLink: { color: COLORS.primary, fontWeight: '700' },
});
