// screens/ScanScreen.js
import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, TextInput,
  Animated, Vibration, KeyboardAvoidingView, Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function ScanScreen({ navigation }) {
  const { colors } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [scanHistory, setScanHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState(null);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualCategory, setManualCategory] = useState('General');
  const [showManualForm, setShowManualForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const isProcessing = useRef(false);

  const categories = [
    'Food', 'Snacks', 'Dairy', 'Beverages',
    'Beauty', 'Household', 'Bakery', 'General'
  ];

  const showToastMsg = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const showSuccess = (msg = 'Added to Cart!') => {
    showToastMsg('✅ ' + msg);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const showManualCard = () => {
    Animated.spring(cardAnim, {
      toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
    }).start();
  };

  const hideManualCard = () => {
    Animated.timing(cardAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => {
      setShowManualForm(false);
      setNotFoundBarcode(null);
      setManualName('');
      setManualPrice('');
      setManualCategory('General');
      setScanned(false);
      isProcessing.current = false;
    });
  };

  const addToHistory = (product) => {
    setScanHistory(prev => {
      const filtered = prev.filter(p => p.barcode !== product.barcode);
      return [product, ...filtered].slice(0, 10);
    });
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || isProcessing.current) return;
    isProcessing.current = true;
    setScanned(true);
    setScanning(false);
    setLoading(true);
    Vibration.vibrate(100);

    try {
      const q = query(
        collection(db, 'products'),
        where('barcode', '==', data)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const product = { id: snap.docs[0].id, ...snap.docs[0].data() };
        addToCart(product);
        addToHistory(product);
        showSuccess(product.name + ' added!');
        setTimeout(() => Vibration.vibrate([0, 80, 80, 80]), 150);
        setTimeout(() => {
          setScanned(false);
          setScanning(true);
          isProcessing.current = false;
        }, 1500);
      } else {
        setNotFoundBarcode(data);
        setShowManualForm(true);
        showManualCard();
        isProcessing.current = false;
      }
    } catch (e) {
      console.log('Scan error:', e);
      isProcessing.current = false;
      setScanned(false);
      setScanning(true);
    }
    setLoading(false);
  };

  const handleManualAdd = async () => {
    if (!manualName.trim()) {
      showToastMsg('⚠️ Please enter product name!');
      return;
    }
    if (!manualPrice || isNaN(manualPrice) || parseFloat(manualPrice) <= 0) {
      showToastMsg('⚠️ Please enter valid price!');
      return;
    }

    setSaving(true);
    const newProduct = {
      name: manualName.trim(),
      price: parseFloat(manualPrice),
      category: manualCategory,
      barcode: notFoundBarcode,
      description: 'Added by scanner',
      stock: 99,
      discount: 0,
    };

    try {
      // Save to Firebase automatically
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      const savedProduct = { id: docRef.id, ...newProduct };
      addToCart(savedProduct);
      addToHistory(savedProduct);
      Vibration.vibrate([0, 80, 80, 80]);
      showToastMsg('✅ ' + newProduct.name + ' saved & added!');
      setSaving(false);
      hideManualCard();
      setTimeout(() => {
        setScanned(false);
        setScanning(true);
      }, 1000);
    } catch (e) {
      console.log('Save error:', e);
      showToastMsg('❌ Could not save. Try again!');
      setSaving(false);
    }
  };

  const handleHistoryAdd = (product) => {
    addToCart(product);
    Vibration.vibrate(80);
    showToastMsg('✅ ' + product.name + ' added!');
    setShowHistory(false);
  };

  const zoomIn = () => setZoom(prev => Math.min(+(prev + 0.1).toFixed(1), 1));
  const zoomOut = () => setZoom(prev => Math.max(+(prev - 0.1).toFixed(1), 0));

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1], outputRange: [400, 0],
  });

  const successScale = successAnim.interpolate({
    inputRange: [0, 0.5, 1], outputRange: [0, 1.2, 1],
  });

  if (!permission) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (!permission.granted) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={{ fontSize: 56, marginBottom: 16 }}>📷</Text>
      <Text style={[styles.permText, { color: colors.text }]}>
        Camera access needed to scan products
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={requestPermission}
      >
        <Text style={styles.buttonText}>Allow Camera</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Toast */}
      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {scanning ? (
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            enableTorch={torch}
            zoom={zoom}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr', 'ean13', 'ean8',
                'code128', 'code39',
                'upc_a', 'upc_e',
              ],
            }}
          />

          <View style={styles.overlayTop} />
          <View style={styles.overlayBottom} />

          {/* Scan frame */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanHint}>
              Scan → instantly added to cart!
            </Text>
          </View>

          {/* Top buttons */}
          <View style={styles.topButtons}>
            <TouchableOpacity
              style={[styles.iconBtn, torch && styles.torchOn]}
              onPress={() => setTorch(!torch)}
            >
              <Text style={styles.iconBtnText}>🔦</Text>
              <Text style={[styles.iconBtnLabel, torch && { color: '#333' }]}>
                {torch ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>

            {getTotalItems() > 0 && (
              <TouchableOpacity
                style={styles.cartCount}
                onPress={() => {
                  setScanning(false);
                  navigation.navigate('Payment');
                }}
              >
                <Text style={styles.cartCountText}>
                  🛒 {getTotalItems()} items → Pay
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Text style={styles.iconBtnText}>🕐</Text>
              <Text style={styles.iconBtnLabel}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Zoom controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.zoomTrack}>
              <View style={[styles.zoomFill, { width: `${zoom * 100}%` }]} />
            </View>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.zoomValue}>
              {zoom === 0 ? '1x' : (1 + zoom * 9).toFixed(1) + 'x'}
            </Text>
          </View>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setScanning(false);
              setScanned(false);
              setTorch(false);
              setZoom(0);
              isProcessing.current = false;
            }}
          >
            <Text style={styles.cancelText}>✕ Cancel</Text>
          </TouchableOpacity>

          {/* History dropdown */}
          {showHistory && scanHistory.length > 0 && (
            <View style={styles.historyDropdown}>
              <Text style={styles.historyDropTitle}>🕐 Recently Scanned</Text>
              {scanHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyDropItem}
                  onPress={() => handleHistoryAdd(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDropName}>{item.name}</Text>
                    <Text style={styles.historyDropPrice}>₹{item.price}</Text>
                  </View>
                  <View style={[styles.historyAddBtn, { backgroundColor: '#6C63FF' }]}>
                    <Text style={styles.historyAddText}>+ Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      ) : (
        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.scanBox, { backgroundColor: colors.card }]}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={[styles.scanTitle, { color: colors.text }]}>
              Scan a Product
            </Text>
            <Text style={[styles.scanSub, { color: colors.subtext }]}>
              Scan barcode → instantly added to cart!
            </Text>
            <View style={styles.featuresRow}>
              <View style={[styles.featurePill, { backgroundColor: colors.background }]}>
                <Text style={[styles.featureText, { color: colors.text }]}>⚡ Instant add</Text>
              </View>
              <View style={[styles.featurePill, { backgroundColor: colors.background }]}>
                <Text style={[styles.featureText, { color: colors.text }]}>💾 Auto save</Text>
              </View>
              <View style={[styles.featurePill, { backgroundColor: colors.background }]}>
                <Text style={[styles.featureText, { color: colors.text }]}>🔦 Torch</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                setScanned(false);
                setScanning(true);
                setZoom(0);
                isProcessing.current = false;
              }}
            >
              <Text style={styles.buttonText}>Open Scanner</Text>
            </TouchableOpacity>
          </View>

          {getTotalItems() > 0 && (
            <TouchableOpacity
              style={[styles.cartBanner, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Payment')}
            >
              <Text style={styles.cartBannerText}>
                🛒 {getTotalItems()} items in cart
              </Text>
              <Text style={styles.cartBannerSub}>Tap to go to Cart →</Text>
            </TouchableOpacity>
          )}

          {/* Scan history */}
          {scanHistory.length > 0 && (
            <View style={[styles.historySection, { backgroundColor: colors.card }]}>
              <Text style={[styles.historySectionTitle, { color: colors.text }]}>
                🕐 Recently Scanned
              </Text>
              {scanHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.historyRow, { borderColor: colors.border }]}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.subtext }}>
                      {item.category} • ₹{item.price}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.historyAddBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      addToCart(item);
                      Vibration.vibrate(80);
                      showToastMsg('✅ ' + item.name + ' added!');
                    }}
                  >
                    <Text style={styles.historyAddText}>+ Add</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Scanning...</Text>
        </View>
      )}

      {/* Success animation */}
      <Animated.View
        style={[styles.successOverlay, {
          opacity: successAnim,
          transform: [{ scale: successScale }],
        }]}
        pointerEvents="none"
      >
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successText}>Added to Cart!</Text>
      </Animated.View>

      {/* Manual entry form with KeyboardAvoidingView */}
      {showManualForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBg}
          keyboardVerticalOffset={10}
        >
          <Animated.View style={[
            styles.manualCard,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: cardTranslateY }]
            }
          ]}>
            <View style={styles.notFoundBadge}>
              <Text style={styles.notFoundText}>❓ Not Found in Database</Text>
            </View>

            <Text style={[styles.manualTitle, { color: colors.text }]}>
              New Product!
            </Text>
            <Text style={[styles.manualSub, { color: colors.subtext }]}>
              Barcode: {notFoundBarcode}
            </Text>

            {/* Save notice */}
            <View style={styles.saveNotice}>
              <Text style={styles.saveNoticeText}>
                💾 Will be saved to database automatically!
              </Text>
            </View>

            <TextInput
              style={[styles.manualInput, {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              }]}
              placeholder="Product name *"
              placeholderTextColor={colors.subtext}
              value={manualName}
              onChangeText={setManualName}
              returnKeyType="next"
              autoFocus
            />

            <TextInput
              style={[styles.manualInput, {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              }]}
              placeholder="Price (₹) *"
              placeholderTextColor={colors.subtext}
              keyboardType="number-pad"
              value={manualPrice}
              onChangeText={setManualPrice}
              returnKeyType="done"
            />

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
              keyboardShouldPersistTaps="handled"
            >
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    manualCategory === cat && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setManualCategory(cat)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    manualCategory === cat && { color: '#fff' }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.manualAddBtn, {
                backgroundColor: saving ? '#aaa' : colors.primary
              }]}
              onPress={handleManualAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.manualAddBtnText}>
                  💾 Save & Add to Cart
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={hideManualCard}
            >
              <Text style={[styles.skipText, { color: colors.subtext }]}>
                Skip & Scan Another
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permText: { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  content: { flex: 1 },
  toast: {
    position: 'absolute', top: 60, alignSelf: 'center',
    backgroundColor: '#222', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 25, zIndex: 999, elevation: 10,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  scanBox: {
    borderRadius: 16, padding: 32,
    alignItems: 'center', margin: 24, elevation: 3,
  },
  scanIcon: { fontSize: 56, marginBottom: 16 },
  scanTitle: { fontSize: 22, fontWeight: 'bold' },
  scanSub: { fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 16 },
  featuresRow: {
    flexDirection: 'row', gap: 8,
    marginBottom: 20, flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  featureText: { fontSize: 12, fontWeight: '500' },
  button: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cartBanner: { margin: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
  cartBannerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cartBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  historySection: { margin: 16, borderRadius: 16, padding: 16, elevation: 2 },
  historySectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5,
  },
  historyName: { fontSize: 13, fontWeight: '600' },
  historyAddBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  historyAddText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  scannerContainer: { flex: 1 },
  overlayTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '20%', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '28%', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  scanFrame: { width: 260, height: 200, position: 'relative' },
  corner: {
    position: 'absolute', width: 36, height: 36,
    borderColor: '#6C63FF', borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 4 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 4 },
  scanHint: {
    color: '#fff', fontSize: 13, marginTop: 20, fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  topButtons: {
    position: 'absolute', top: 50,
    left: 16, right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 8, alignItems: 'center',
  },
  torchOn: { backgroundColor: '#FFD600' },
  iconBtnText: { fontSize: 20 },
  iconBtnLabel: { color: '#fff', fontSize: 10, marginTop: 2 },
  cartCount: {
    backgroundColor: '#6C63FF',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  cartCountText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  zoomControls: {
    position: 'absolute', bottom: 110,
    left: 30, right: 30,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30, paddingHorizontal: 16, paddingVertical: 10,
  },
  zoomBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  zoomBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 24 },
  zoomTrack: {
    flex: 1, height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, overflow: 'hidden',
  },
  zoomFill: { height: 4, backgroundColor: '#6C63FF', borderRadius: 2 },
  zoomValue: { color: '#fff', fontSize: 12, fontWeight: '600', minWidth: 32 },
  cancelBtn: {
    position: 'absolute', bottom: 44, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25,
  },
  cancelText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  historyDropdown: {
    position: 'absolute', top: 110,
    left: 16, right: 16,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16,
    elevation: 10, maxHeight: 280,
  },
  historyDropTitle: {
    fontSize: 14, fontWeight: 'bold',
    color: '#333', marginBottom: 10,
  },
  historyDropItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  historyDropName: { fontSize: 13, fontWeight: '600', color: '#333' },
  historyDropPrice: { fontSize: 12, color: '#6C63FF', marginTop: 2 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 15 },
  successOverlay: {
    position: 'absolute',
    top: '38%', alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 20, padding: 28,
    alignItems: 'center',
  },
  successIcon: { fontSize: 52 },
  successText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  modalBg: {
    position: 'absolute', bottom: 0,
    left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 12,
  },
  manualCard: { borderRadius: 24, padding: 24 },
  notFoundBadge: {
    backgroundColor: '#FFF3E0', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  notFoundText: { color: '#E65100', fontSize: 12, fontWeight: '600' },
  manualTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  manualSub: { fontSize: 12, marginBottom: 4 },
  saveNotice: {
    backgroundColor: '#E8F5E9', borderRadius: 10,
    padding: 10, marginTop: 10, marginBottom: 4,
  },
  saveNoticeText: { color: '#2E7D32', fontSize: 12, fontWeight: '500' },
  manualInput: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, marginTop: 12,
  },
  categoryChip: {
    backgroundColor: '#f0eeff',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginRight: 8,
  },
  categoryChipText: { fontSize: 12, fontWeight: '500', color: '#6C63FF' },
  manualAddBtn: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 16,
  },
  manualAddBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 14 },
});