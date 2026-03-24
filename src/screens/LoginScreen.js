import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    const result = await login(username, password);
    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Welcome Back! <Text style={styles.emoji}>🛒</Text></Text>
        <Text style={styles.subtitle}>Login with your username to start shopping locally.</Text>
        
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput 
            placeholder="Username" 
            value={username} 
            onChangeText={setUsername} 
            style={styles.input} 
            autoCapitalize="none" 
            placeholderTextColor={COLORS.textMuted} 
          />
        </View>
        
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            style={styles.input} 
            secureTextEntry={!showPass} 
            placeholderTextColor={COLORS.textMuted} 
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Login'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 40 },
  backBtn: { 
    width: 45, 
    height: 45, 
    borderRadius: 15, 
    backgroundColor: COLORS.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 35,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  emoji: { color: COLORS.primary },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: 40, lineHeight: 24 },
  inputWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 15, 
    marginBottom: 20, 
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: COLORS.text },
  eyeBtn: { padding: 10 },
  loginBtn: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 15, 
    marginBottom: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  registerText: { textAlign: 'center', fontSize: 15, color: COLORS.textMuted },
  registerLink: { color: COLORS.primary, fontWeight: '700' },
});
