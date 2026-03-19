import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerBuyer, registerSeller } = useAuth();

  const handleRegister = () => {
    if (!name || !email || !password) { 
      Alert.alert('Error', 'Please fill all fields');
      return; 
    }
    if (role === 'buyer') {
      registerBuyer(name, email, password).then(result => {
        if (result.success) {
          Alert.alert('Success', 'Registration successful!');
          navigation.goBack();
        } else {
          Alert.alert('Error', result.error);
        }
      });
    } else {
      registerSeller({ name, email, password }).then(result => {
        if (result.success) {
          Alert.alert('Success', 'Registration successful!');
          navigation.goBack();
        } else {
          Alert.alert('Error', result.error);
        }
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
      </TouchableOpacity>
      <Text style={styles.title}>Create Account 🇮🇳</Text>
      <Text style={styles.subtitle}>Join Indian Local Store today</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity style={[styles.roleBtn, role === 'buyer' && styles.roleBtnActive]} onPress={() => setRole('buyer')}>
          <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>🛍️ Buyer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleBtn, role === 'seller' && styles.roleBtnActive]} onPress={() => setRole('seller')}>
          <Text style={[styles.roleText, role === 'seller' && styles.roleTextActive]}>🏪 Seller</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrap}>
        <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor={COLORS.textMuted} />
      </View>
      <View style={styles.inputWrap}>
        <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput placeholder="Email address" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textMuted} />
      </View>
      <View style={styles.inputWrap}>
        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholderTextColor={COLORS.textMuted} />
      </View>
      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.registerBtnText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 24, paddingTop: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.gray, marginBottom: 24 },
  roleRow: { flexDirection: 'row', marginBottom: 24 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', marginRight: 8 },
  roleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  roleText: { fontSize: 15, fontWeight: '700', color: COLORS.gray },
  roleTextActive: { color: COLORS.primary },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGray, borderRadius: 14, marginBottom: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.dark },
  registerBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  registerBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  loginText: { textAlign: 'center', fontSize: 14, color: COLORS.gray },
  loginLink: { color: COLORS.primary, fontWeight: '700' },
});
