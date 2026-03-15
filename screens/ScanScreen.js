import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, TextInput
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function ScanScreen() {
  const { colors } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [manualPrice, setManualPrice] = useState('');
  const isProcessing = useRef(false);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isProcessing.current) return;
    isProcessing.current = true;
    setScanned(true);
    setScanning(false);
    setLoading(true);
    try {
      const q = query(
        collection(db, 'products'),
        where('barcode', '==', data)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const productData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
        setProduct(productData);
        isProcessing.current = false;
      } else {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${data}.json`
        );
        const result = await response.json();

        if (result.status === 1 && result.product) {
          const p = result.product;
          const externalProduct = {
            id: data,
            name: p.product_name ||
              p.abbreviated_product_name ||
              'Unknown Product',
            description: p.brands ||
              p.categories ||
              'Scanned product',
            category: p.categories_tags?.[0]
              ?.replace('en:', '') || 'General',
            barcode: data,
            price: 0,
            stock: 99,
            fromAPI: true,
          };
          setProduct(externalProduct);
          isProcessing.current = false;
        } else {
          Alert.alert(
            'Product Not Found',
            `Barcode: ${data}\nNot in our database or online.`,
            [
              {
                text: 'Close',
                style: 'cancel',
                onPress: () => {
                  isProcessing.current = false;
                  setScanned(false);
                  setScanning(false);
                }
              },
              {
                text: 'Scan Again',
                onPress: () => {
                  isProcessing.current = false;
                  setScanned(false);
                  setScanning(true);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch product. Try again.');
      isProcessing.current = false;
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    let finalProduct = { ...product };
    if (product.fromAPI) {
      if (!manualPrice || isNaN(manualPrice)) {
        
        return;
      }
      finalProduct.price = parseFloat(manualPrice);
    }
    addToCart(finalProduct);
    setProduct(null);
    setScanned(false);
    setManualPrice('');
    isProcessing.current = false;
    Alert.alert('Added! ✅', `${finalProduct.name} added to cart!`);
  };

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.permText, { color: colors.text }]}>
          Camera access is needed to scan products
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {scanning ? (
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a'
              ],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanHint}>
              Point camera at barcode
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setScanning(false);
              setScanned(false);
              isProcessing.current = false;
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={[styles.scanBox, { backgroundColor: colors.card }]}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={[styles.scanTitle, { color: colors.text }]}>
              Scan a Product
            </Text>
            <Text style={[styles.scanSub, { color: colors.subtext }]}>
              Point camera at any product barcode
            </Text>
            <Text style={[styles.scanNote, { color: colors.primary }]}>
              🌐 Works with millions of products worldwide!
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                setScanned(false);
                setScanning(true);
                isProcessing.current = false;
              }}
            >
              <Text style={styles.buttonText}>Open Scanner</Text>
            </TouchableOpacity>
          </View>

          {getTotalItems() > 0 && (
            <View style={[styles.cartBanner, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBannerText}>
                🛒 {getTotalItems()} items in cart
              </Text>
              <Text style={styles.cartBannerSub}>
                Go to Cart tab to pay
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Finding product...</Text>
        </View>
      )}

      {product && (
        <View style={styles.productModal}>
          <View style={[styles.productCard, { backgroundColor: colors.card }]}>

            {product.fromAPI && (
              <View style={styles.apiBadge}>
                <Text style={styles.apiBadgeText}>
                  🌐 Found Online
                </Text>
              </View>
            )}

            <Text style={[styles.productName, { color: colors.text }]}>
              {product.name}
            </Text>
            <Text style={[styles.productDesc, { color: colors.subtext }]}>
              {product.description}
            </Text>
            <Text style={[styles.productCategory, { color: colors.primary }]}>
              {product.category}
            </Text>

            <View style={styles.priceRow}>
              {product.fromAPI ? (
                <View style={styles.priceInputRow}>
                  <Text style={[styles.rupeeSign, { color: colors.primary }]}>
                    ₹
                  </Text>
                  <TextInput
                    style={[styles.priceInput, {
                      color: colors.text,
                      borderColor: colors.primary,
                      backgroundColor: colors.background,
                    }]}
                    placeholder="Enter price"
                    placeholderTextColor={colors.subtext}
                    keyboardType="number-pad"
                    value={manualPrice}
                    onChangeText={setManualPrice}
                  />
                </View>
              ) : (
                <Text style={[styles.productPrice, { color: colors.primary }]}>
                  ₹{product.price}
                </Text>
              )}
              <Text style={[styles.productStock, { color: colors.subtext }]}>
                Stock: {product.stock}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddToCart}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setProduct(null);
                setScanned(false);
                isProcessing.current = false;
                setManualPrice('');
              }}
            >
              <Text style={[styles.skipText, { color: colors.subtext }]}>
                Scan Another
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  permText: {
    fontSize: 15, textAlign: 'center', marginBottom: 20,
  },
  content: { flex: 1 },
  scanBox: {
    borderRadius: 16, padding: 36,
    alignItems: 'center', margin: 24, elevation: 3,
  },
  scanIcon: { fontSize: 48, marginBottom: 16 },
  scanTitle: { fontSize: 20, fontWeight: 'bold' },
  scanSub: {
    fontSize: 13, textAlign: 'center',
    marginTop: 8, marginBottom: 8,
  },
  scanNote: {
    fontSize: 12, textAlign: 'center',
    marginBottom: 20, fontWeight: '500',
  },
  button: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cartBanner: {
    margin: 16, borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  cartBannerText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
  },
  cartBannerSub: {
    color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4,
  },
  scannerContainer: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  scanFrame: { width: 250, height: 250, position: 'relative' },
  corner: {
    position: 'absolute', width: 30, height: 30,
    borderColor: '#6C63FF', borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  scanHint: {
    color: '#fff', fontSize: 14, marginTop: 24, fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  cancelBtn: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25,
  },
  cancelText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
  productModal: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 16,
  },
  productCard: { borderRadius: 20, padding: 24 },
  apiBadge: {
    backgroundColor: '#E6F1FB',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start',
    marginBottom: 8,
  },
  apiBadgeText: {
    fontSize: 12, color: '#0C447C', fontWeight: '600',
  },
  productName: { fontSize: 20, fontWeight: 'bold' },
  productDesc: { fontSize: 14, marginTop: 4 },
  productCategory: {
    fontSize: 12, paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 20,
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: '#f0eeff',
  },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16, marginBottom: 16,
  },
  priceInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  rupeeSign: { fontSize: 24, fontWeight: 'bold' },
  priceInput: {
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 20, fontWeight: 'bold', width: 120,
  },
  productPrice: { fontSize: 28, fontWeight: 'bold' },
  productStock: { fontSize: 13 },
  addButton: {
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14 },
});