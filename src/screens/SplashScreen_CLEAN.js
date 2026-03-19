import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

/**
 * SplashScreen
 * ============
 * Purpose: Shows loading animation when app starts
 * 
 * Flow:
 * 1. App launches
 * 2. SplashScreen shows with animation
 * 3. App checks if user is logged in
 * 4. Routes to LoginScreen (new user) or HomeScreen (existing user)
 * 
 * Props:
 * - navigation: For navigating to other screens
 */
export default function SplashScreen({ navigation }) {
  const scaleAnim = new Animated.Value(0.8);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Step 1: Animate splash screen entrance
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Step 2: Wait 2.5 seconds, then navigate
    const timer = setTimeout(() => {
      // In real app: Check if token exists in AsyncStorage
      // If yes: navigation.replace('AuthStack')
      // If no: navigation.replace('LoginStack')
      
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* App Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🛒</Text>
        </View>

        {/* App Title */}
        <Text style={styles.title}>INDIAN LOCAL STORE</Text>
        <Text style={styles.subtitle}>Your Neighborhood Marketplace</Text>

        {/* Loading Animation */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
        </View>

        {/* Indian Flag */}
        <View style={styles.flag}>
          <View style={[styles.flagPart, { backgroundColor: '#FF8C00' }]} />
          <View style={[styles.flagPart, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.flagPart, { backgroundColor: '#138808' }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flag: {
    flexDirection: 'row',
    width: 60,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  flagPart: {
    flex: 1,
  },
});
