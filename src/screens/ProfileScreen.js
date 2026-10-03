import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Linking } from 'react-native';
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
    { name: 'Contact & Support', icon: 'chatbubbles-outline' },
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Header Gradient */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.greetingTextWrap}>
              <Text style={styles.greetingName}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User'}</Text>
              <Text style={styles.greetingEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{isSeller ? 'Seller Account' : 'Customer Account'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          
          <View style={styles.menuCard}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity style={styles.menuListBtn} onPress={() => navigation.navigate('Orders')}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}>
                <Ionicons name="cube" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuListText}>
                <Text style={styles.menuListTitle}>Your Orders</Text>
                <Text style={styles.menuListSub}>Track, return, or buy things again</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuListBtn} onPress={() => navigation.navigate('Wishlist')}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}>
                <Ionicons name="heart" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuListText}>
                <Text style={styles.menuListTitle}>Wishlist</Text>
                <Text style={styles.menuListSub}>Your saved favorite products</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuListBtn} onPress={() => navigation.navigate('AddressBook')}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}>
                <Ionicons name="location" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuListText}>
                <Text style={styles.menuListTitle}>Your Addresses</Text>
                <Text style={styles.menuListSub}>Edit addresses for orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuListBtn}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuListText}>
                <Text style={styles.menuListTitle}>Login & Security</Text>
                <Text style={styles.menuListSub}>Manage passwords and security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuListBtn, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL('https://wa.me/919900000000')}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}>
                <Ionicons name="chatbubbles" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuListText}>
                <Text style={styles.menuListTitle}>Contact & Support</Text>
                <Text style={styles.menuListSub}>Get help from our team via WhatsApp</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>
          </View>

          {isSeller && (
            <View style={styles.menuCard}>
              <Text style={styles.sectionTitle}>Seller Tools</Text>
              <TouchableOpacity style={[styles.menuListBtn, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('SellerDashboard')}>
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                  <Ionicons name="storefront" size={22} color="#2ecc71" />
                </View>
                <View style={styles.menuListText}>
                  <Text style={styles.menuListTitle}>Seller Dashboard</Text>
                  <Text style={styles.menuListSub}>Manage your products and orders</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 60 },
  
  // Header Gradient (using absolute positioned view to act as background)
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOWS.lg,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { 
    width: 72, height: 72, borderRadius: 36, 
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', 
    marginRight: 20, ...SHADOWS.sm 
  },
  avatarText: { color: COLORS.primary, fontSize: 32, fontWeight: '800' },
  greetingTextWrap: { flex: 1 },
  greetingName: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  greetingEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginBottom: 8 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  roleText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  // Content Area
  contentArea: { paddingHorizontal: 20, marginTop: -20 },
  
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  
  menuListBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuListText: { flex: 1 },
  menuListTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  menuListSub: { fontSize: 13, color: COLORS.textMuted },
  
  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, gap: 10,
    ...SHADOWS.sm, marginTop: 10
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#e74c3c' },

  // Guest State
  guestContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  guestIcon: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 60, padding: 20, ...SHADOWS.lg },
  guestTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  guestSub: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 40, fontWeight: '500' },
  primaryBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 20, borderRadius: RADIUS.xl, alignItems: 'center', marginBottom: 16, ...SHADOWS.lg },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});




