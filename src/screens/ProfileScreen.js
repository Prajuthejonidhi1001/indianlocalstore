import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.guestBox}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>Welcome to Indian Local Store</Text>
          <Text style={styles.guestSub}>Login or register to access your profile</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBtnText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.name ? user.name[0] : 'U'}</Text></View>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.typeBadge}><Text style={styles.typeText}>{user.type === 'seller' ? '🏪 Seller' : '🛍️ Buyer'}</Text></View>
        </View>
        <View style={styles.menuSection}>
          {[
            { icon: 'person-outline', label: 'My Account' },
            { icon: 'heart-outline', label: 'Saved Shops' },
            { icon: 'time-outline', label: 'Recent Views' },
            { icon: 'settings-outline', label: 'Settings' },
            { icon: 'help-circle-outline', label: 'Help & Support' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem}>
              <View style={styles.menuIcon}><Ionicons name={item.icon} size={22} color={COLORS.primary} /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}> Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  guestBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 80 },
  guestEmoji: { fontSize: 60, marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, textAlign: 'center', marginBottom: 8 },
  guestSub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 32 },
  loginBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 60, borderRadius: 14, marginBottom: 12, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  registerBtn: { backgroundColor: COLORS.white, paddingVertical: 14, paddingHorizontal: 60, borderRadius: 14, borderWidth: 2, borderColor: COLORS.primary, width: '100%', alignItems: 'center' },
  registerBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  header: { backgroundColor: COLORS.primary, paddingTop: 60, paddingBottom: 30, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 12 },
  typeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 },
  typeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  menuSection: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 20, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.dark },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, marginTop: 20, backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 14 },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },
});
