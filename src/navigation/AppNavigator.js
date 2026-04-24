import React from 'react';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import SectorDetailScreen from '../screens/SectorDetailScreen';
import SubcategoryScreen from '../screens/SubcategoryScreen';
import ShopProductsScreen from '../screens/ShopProductsScreen';
import NearbyShopsScreen from '../screens/NearbyShopsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// E-Commerce Screens
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SellerDashboardScreen from '../screens/SellerDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const { width } = Dimensions.get('window');

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="SectorDetail" component={SectorDetailScreen} />
      <Stack.Screen name="Subcategory" component={SubcategoryScreen} />
      <Stack.Screen name="ShopProducts" component={ShopProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="CategoriesList" component={CategoriesScreen} />
      <Stack.Screen name="SectorDetail" component={SectorDetailScreen} />
      <Stack.Screen name="Subcategory" component={SubcategoryScreen} />
      <Stack.Screen name="ShopProducts" component={ShopProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Categories: focused ? 'grid' : 'grid-outline',
            Nearby: focused ? 'location' : 'location-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Nearby" component={NearbyShopsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

import { useAuth } from '../context/AuthContext';

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <View style={{flex: 1, backgroundColor: COLORS.background}} />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
      {!isAuthenticated ? (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
          <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          
          {/* Global E-Commerce & Management Screens (Hides Tab Bar) */}
          <RootStack.Screen name="Cart" component={CartScreen} />
          <RootStack.Screen name="Checkout" component={CheckoutScreen} />
          <RootStack.Screen name="Orders" component={OrdersScreen} />
          <RootStack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
          <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 15,
    left: 20,
    right: 20,
    height: 65,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(19, 25, 32, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderStrong,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    ...SHADOWS.lg,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    paddingTop: 10,
    elevation: 10,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: -5,
  }
});
