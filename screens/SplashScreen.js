import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const bgScale      = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoRotate   = useRef(new Animated.Value(-15)).current;
  const textY        = useRef(new Animated.Value(40)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const shimmerX     = useRef(new Animated.Value(-width)).current;
  const bottomOp     = useRef(new Animated.Value(0)).current;
  const barWidth     = useRef(new Animated.Value(0)).current;
  const exitScale    = useRef(new Animated.Value(1)).current;
  const exitOpacity  = useRef(new Animated.Value(1)).current;
  const [showShimmer, setShowShimmer] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgScale, { toValue: 30, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(logoRotate, { toValue: 0, tension: 80, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOp, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(bottomOp, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(barWidth, { toValue: 160, duration: 900, useNativeDriver: false }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(exitScale, { toValue: 1.15, duration: 350, useNativeDriver: true }),
        Animated.timing(exitOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());

    setTimeout(() => {
      setShowShimmer(true);
      Animated.loop(
        Animated.timing(shimmerX, { toValue: width, duration: 1200, useNativeDriver: true })
      ).start();
    }, 950);
  }, []);

  const spin = logoRotate.interpolate({
    inputRange: [-15, 0], outputRange: ['-15deg', '0deg']
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>
      <Animated.View style={[styles.burst, { transform: [{ scale: bgScale }] }]} />
      <View style={[styles.decor, { top: -60, right: -60, width: 200, height: 200, opacity: 0.08 }]} />
      <View style={[styles.decor, { bottom: 100, left: -80, width: 280, height: 280, opacity: 0.06 }]} />

      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { rotate: spin }]
        }]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoEmoji}>🛒</Text>
            </View>
          </View>
          <View style={styles.glowRing} />
        </Animated.View>

        <Animated.View style={{
          opacity: textOpacity,
          transform: [{ translateY: textY }],
          overflow: 'hidden'
        }}>
          <Text style={styles.appName}>ScanPay</Text>
          {showShimmer && (
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
          )}
        </Animated.View>

        <Animated.View style={{ opacity: taglineOp, alignItems: 'center' }}>
          <Text style={styles.tagline}>Scan. Pay. Verify.</Text>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, { opacity: 0.5 }]} />
            <View style={[styles.dot, { opacity: 0.3 }]} />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottom, { opacity: bottomOp }]}>
        <Text style={styles.bottomText}>Smart Shopping Experience</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: barWidth }]} />
        </View>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#6C63FF',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  burst: {
    position: 'absolute', width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#5A52E0',
  },
  decor: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  content: { alignItems: 'center', zIndex: 10 },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  logoOuter: {
    width: 130, height: 130, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  logoInner: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { fontSize: 52 },
  glowRing: {
    position: 'absolute', width: 160, height: 160,
    borderRadius: 80, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appName: {
    fontSize: 48, fontWeight: '800', color: '#fff',
    textAlign: 'center', letterSpacing: 3,
  },
  shimmer: {
    position: 'absolute', top: 0, bottom: 0, width: 80,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ skewX: '-20deg' }],
  },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', marginTop: 10, letterSpacing: 2,
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  bottom: { position: 'absolute', bottom: 56, alignItems: 'center', zIndex: 10 },
  bottomText: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12,
    marginBottom: 12, letterSpacing: 1,
  },
  track: {
    width: 160, height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, overflow: 'hidden',
  },
  bar: { height: 3, backgroundColor: '#fff', borderRadius: 2 },
  version: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 10 },
});