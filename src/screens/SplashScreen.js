import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const flagOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    // Entry sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(flagOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1000),
    ]).start(() => { onFinish(); });
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });
  const orb1Y = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const orb2Y = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050814" />

      {/* Animated orbs */}
      <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />

      {/* Logo area */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        {/* Glow ring */}
        <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
        
        <View style={styles.logoBox}>
          <View style={styles.flagMini}>
            <View style={[styles.flagBand, { backgroundColor: '#FF8C00' }]} />
            <View style={[styles.flagBand, { backgroundColor: '#FFFFFF' }]}>
              <Text style={styles.chakra}>☸</Text>
            </View>
            <View style={[styles.flagBand, { backgroundColor: '#138808' }]} />
          </View>
          <Text style={styles.cartEmoji}>🛒</Text>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>INDIAN</Text>
        <Text style={styles.appNameSub}>LOCAL STORE</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Trusted Neighbourhood Marketplace 🇮🇳
      </Animated.Text>

      {/* Bottom flag strip */}
      <Animated.View style={[styles.flagStrip, { opacity: flagOpacity }]}>
        <View style={[styles.strip, { backgroundColor: '#FF8C00' }]} />
        <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.strip, { backgroundColor: '#138808' }]} />
      </Animated.View>

      {/* Dot loader */}
      <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  orb1: {
    width: 350, height: 350,
    backgroundColor: '#FF6B35',
    top: -100, left: -80,
    filter: 'blur(80px)',
  },
  orb2: {
    width: 280, height: 280,
    backgroundColor: '#FFB627',
    bottom: -80, right: -60,
  },
  logoWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: '#FF6B35',
    opacity: 0.2,
    transform: [{ scale: 1.3 }],
  },
  logoBox: {
    width: 130, height: 130,
    borderRadius: 36,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,53,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  cartEmoji: { fontSize: 52, marginTop: 4 },
  flagMini: {
    position: 'absolute',
    top: 8, right: 8,
    width: 22, height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  flagBand: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chakra: { fontSize: 7, color: '#000080' },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(255,107,53,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  appNameSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 6,
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  flagStrip: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    height: 5,
  },
  strip: { flex: 1 },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 48,
    alignItems: 'center',
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: '#FF6B35',
    width: 20,
    borderRadius: 3,
  },
});
