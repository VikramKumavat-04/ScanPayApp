import { useEffect, useRef } from 'react';

import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }
        ]}>
          <Text style={styles.logoEmoji}>🛒</Text>
        </Animated.View>

        <Animated.View style={{
          opacity: textOpacity,
          transform: [{ translateY: slideUp }]
        }}>
          <Text style={styles.appName}>ScanPay</Text>
        </Animated.View>

        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={styles.tagline}>Scan. Pay. Verify.</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottom, { opacity: taglineOpacity }]}>
        <Text style={styles.bottomText}>Smart Shopping Experience</Text>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center' },
  logoContainer: {
    width: 120, height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 60 },
  appName: {
    fontSize: 42, fontWeight: 'bold',
    color: '#fff', textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16, color: 'rgba(255,255,255,0.8)',
    textAlign: 'center', marginTop: 8, letterSpacing: 1,
  },
  bottom: {
    position: 'absolute', bottom: 60, alignItems: 'center',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16,
  },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: '#fff', width: 24 },
});