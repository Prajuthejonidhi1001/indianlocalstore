import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const flagOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(flagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(900),
    ]).start(() => { onFinish(); });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.cartWrapper}>
          <Text style={styles.cartIcon}>🛒</Text>
          <Animated.View style={[styles.flagPin, { opacity: flagOpacity }]}>
            <View style={styles.flagOrange} />
            <View style={styles.flagWhite}><Text style={styles.chakra}>☸</Text></View>
            <View style={styles.flagGreen} />
          </Animated.View>
        </View>
        <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>INDIAN</Animated.Text>
        <Animated.Text style={[styles.appNameSub, { opacity: textOpacity }]}>LOCAL STORE</Animated.Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Trusted Neighborhood Marketplace
      </Animated.Text>
      <Animated.View style={[styles.flagStrip, { opacity: flagOpacity }]}>
        <View style={[styles.strip, { backgroundColor: '#FF8C00' }]} />
        <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.strip, { backgroundColor: '#138808' }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B5E', justifyContent: 'center', alignItems: 'center' },
  logoBox: {
    width: 220, height: 220, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20,
  },
  cartWrapper: { position: 'relative', marginBottom: 8 },
  cartIcon: { fontSize: 64 },
  flagPin: {
    position: 'absolute', top: -4, right: -8, width: 24, height: 24,
    borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#fff',
  },
  flagOrange: { flex: 1, backgroundColor: '#FF8C00' },
  flagWhite: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  chakra: { fontSize: 8, color: '#000080' },
  flagGreen: { flex: 1, backgroundColor: '#138808' },
  appName: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4 },
  appNameSub: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 6, marginTop: 2 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 16, paddingHorizontal: 40 },
  flagStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', height: 6 },
  strip: { flex: 1 },
});
