import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
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
      if (snapshot.empty) {
        Alert.alert(
          'Product Not Found',
          `Barcode: ${data}\nNot in our database.`,
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
      } else {
        const productData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
        setProduct(productData);
        isProcessing.current = false;
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch product. Try again.');
      isProcessing.current = false;
    }
    setLoading(false);
  };

  const addToCart = () => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setProduct(null);
    setScanned(false);
    isProcessing.current = false;
    Alert.alert('Added! ✅', `${product.name} added to cart!`);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>
          Camera access is needed to scan products
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <Text style={styles.scanHint}>Point camera at barcode</Text>
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
          <View style={styles.scanBox}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanTitle}>Scan a Product</Text>
            <Text style={styles.scanSub}>
              Point your camera at a barcode or QR code
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setScanned(false);
                setScanning(true);
                isProcessing.current = false;
              }}
            >
              <Text style={styles.buttonText}>Open Scanner</Text>
            </TouchableOpacity>
          </View>

          {cart.length > 0 && (
            <View style={styles.cartSection}>
              <Text style={styles.sectionTitle}>
                🛒 Cart ({cart.length} items)
              </Text>
              {cart.map((item, index) => (
                <View key={index} style={styles.cartItem}>
                  <View>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemQty}>Qty: {item.qty}</Text>
                  </View>
                  <Text style={styles.cartItemPrice}>
                    ₹{item.price * item.qty}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹{getTotalAmount()}</Text>
              </View>
              <TouchableOpacity style={styles.payButton}>
                <Text style={styles.payButtonText}>
                  Proceed to Pay ₹{getTotalAmount()}
                </Text>
              </TouchableOpacity>
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
          <View style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDesc}>{product.description}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>₹{product.price}</Text>
              <Text style={styles.productStock}>Stock: {product.stock}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addToCart}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setProduct(null);
                setScanned(false);
                isProcessing.current = false;
              }}
            >
              <Text style={styles.skipText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  permText: {
    fontSize: 15, color: '#333',
    textAlign: 'center', marginBottom: 20,
  },
  content: { flex: 1 },
  scanBox: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 36, alignItems: 'center',
    margin: 24, elevation: 3,
  },
  scanIcon: { fontSize: 48, marginBottom: 16 },
  scanTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  scanSub: {
    fontSize: 13, color: '#888',
    textAlign: 'center', marginTop: 8, marginBottom: 24,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
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
  productCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
  },
  productName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  productDesc: { fontSize: 14, color: '#888', marginTop: 4 },
  productCategory: {
    fontSize: 12, color: '#6C63FF',
    backgroundColor: '#f0eeff',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, marginTop: 8, alignSelf: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16, marginBottom: 16,
  },
  productPrice: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF' },
  productStock: { fontSize: 13, color: '#888' },
  addButton: {
    backgroundColor: '#6C63FF', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: '#888', fontSize: 14 },
  cartSection: {
    backgroundColor: '#fff', margin: 16,
    borderRadius: 16, padding: 16, elevation: 3,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  cartItemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  cartItemQty: { fontSize: 12, color: '#888', marginTop: 2 },
  cartItemPrice: { fontSize: 15, fontWeight: 'bold', color: '#6C63FF' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#6C63FF' },
  payButton: {
    backgroundColor: '#2ecc71', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});