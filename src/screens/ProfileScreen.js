import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('Account Overview');

  const menuItems = [
    { name: 'Account Overview', icon: 'grid-outline' },
    { name: 'Your Orders', icon: 'cube-outline' },
    { name: 'Login & Security', icon: 'shield-checkmark-outline' },
    { name: 'Your Addresses', icon: 'location-outline' },
    { name: 'Wishlist', icon: 'heart-outline' },
    { name: 'Seller Dashboard', icon: 'storefront-outline' },
  ];

  if (!isAuthenticated) {
     return (
      <View style={styles.container}>
        <View style={styles.guestContent}>
          <View style={styles.guestIcon}>
            <Ionicons name="person-circle" size={80} color={COLORS.elevated} />
          </View>
          <Text style={styles.guestTitle}>Join IndianLocalStore</Text>
          <Text style={styles.guestSub}>Sign in to manage your profile, view orders, and support local shops.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getInitials = () => {
    if (!user) return 'U';
    const first = user.first_name ? user.first_name[0] : '';
    const last = user.last_name ? user.last_name[0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  const isSeller = user?.role?.toLowerCase() === 'seller';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* User Greeting Banner */}
        <View style={styles.greetingBanner}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greetingName}>Hello, {user?.first_name || 'User'}</Text>
            <Text style={styles.greetingEmail}>
              {user?.email || 'user@example.com'} • {isSeller ? 'Seller Account' : 'Customer Account'}
            </Text>
          </View>
        </View>

        {/* Horizontal Navigation Menu (App version of Sidebar) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll} contentContainerStyle={styles.menuContainer}>
          {menuItems.map((item, idx) => {
            const isActive = activeTab === item.name;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.menuItem, isActive && styles.menuItemActive]} 
                onPress={() => {
                  setActiveTab(item.name);
                  if (item.name === 'Seller Dashboard') navigation.navigate('SellerDashboard');
                  if (item.name === 'Your Addresses') navigation.navigate('AddressBook');
                  if (item.name === 'Your Orders') navigation.navigate('Orders');
                  if (item.name === 'Wishlist') navigation.navigate('Wishlist');
                }}
              >
                <Ionicons name={item.icon} size={18} color={isActive ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>{item.name}</Text>
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.menuItemText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {activeTab === 'Account Overview' && (
            <View>
              <Text style={styles.sectionTitle}>Account Overview</Text>
              <View style={styles.grid}>
                
                <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Orders')}>
                  <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                    <Ionicons name="cube" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.gridCardText}>
                    <Text style={styles.gridCardTitle}>Your Orders</Text>
                    <Text style={styles.gridCardSub}>Track, return, or buy things again</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard}>
                  <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                    <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.gridCardText}>
                    <Text style={styles.gridCardTitle}>Login & Security</Text>
                    <Text style={styles.gridCardSub}>Edit login, name, and mobile number</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('AddressBook')}>
                  <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                    <Ionicons name="location" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.gridCardText}>
                    <Text style={styles.gridCardTitle}>Your Addresses</Text>
                    <Text style={styles.gridCardSub}>Edit addresses for orders and gifts</Text>
                  </View>
                </TouchableOpacity>

              </View>

              <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Recent Orders</Text>
              <Text style={styles.emptyText}>You have no recent orders.</Text>
            </View>
          )}

          {activeTab === 'Login & Security' && (
            <View>
              <Text style={styles.sectionTitle}>Login & Security</Text>
              <Text style={styles.emptyText}>Manage your password and security settings here.</Text>
            </View>
          )}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  
  // Greeting
  greetingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 24, margin: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  greetingTextWrap: { flex: 1 },
  greetingName: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  greetingEmail: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },

  // Mobile navigation mimicking sidebar
  menuScroll: { paddingHorizontal: 20, marginBottom: 20 },
  menuContainer: { gap: 10, paddingRight: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.full, backgroundColor: '#fff', borderWidth: 1, borderColor: 'transparent', gap: 8 },
  menuItemActive: { backgroundColor: 'rgba(255,107,53,0.08)', borderColor: 'rgba(255,107,53,0.2)' },
  menuItemText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  menuItemTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Content Area
  contentArea: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  
  grid: { gap: 12 },
  gridCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
  gridIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  gridCardText: { flex: 1 },
  gridCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  gridCardSub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },

  emptyText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '500' },

  // Guest State
  guestContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  guestIcon: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 60, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 8 },
  guestTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  guestSub: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 40, fontWeight: '500' },
  primaryBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 20, borderRadius: RADIUS.xl, alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
