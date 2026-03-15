            import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';

export default function VerifyScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const isProcessing = useRef(false);

  const handleScan = async ({ data }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setScanning(false);
    setLoading(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('orderId', '==', data)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setResult({ valid: false, message: 'Invalid QR Code!', sub: 'This receipt was not found.' });
      } else {
        const orderDoc = snapshot.docs[0];
        const order = orderDoc.data();
        if (order.verified) {
          setResult({ valid: false, message: 'Already Verified!', sub: 'This QR was already used.', order });
        } else {
          await updateDoc(doc(db, 'orders', orderDoc.id), { verified: true });
          setResult({ valid: true, message: 'Verified! ✅', sub: 'Customer can pass.', order });
        }
      }
    } catch (error) {
      setResult({ valid: false, message: 'Error!', sub: 'Could not verify. Try again.' });
    }
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    isProcessing.current = false;
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Camera needed</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result) {
    return (
      <View style={[styles.center, { backgroundColor: result.valid ? '#EAF3DE' : '#FCEBEB' }]}>
        <Text style={styles.resultIcon}>{result.valid ? '✅' : '❌'}</Text>
        <Text style={[styles.resultTitle, { color: result.valid ? '#27500A' : '#A32D2D' }]}>
          {result.message}
        </Text>
        <Text style={[styles.resultSub, { color: result.valid ? '#3B6D11' : '#791F1F' }]}>
          {result.sub}
        </Text>
        {result.order && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoText}>Order: {result.order.orderId}</Text>
            <Text style={styles.orderInfoText}>Total: ₹{result.order.total}</Text>
            <Text style={styles.orderInfoText}>Items: {result.order.items?.length}</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: 24 }]} onPress={reset}>
          <Text style={styles.btnText}>Scan Another</Text>
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
            onBarcodeScanned={handleScan}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128'] }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanHint}>Scan customer QR receipt</Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setScanning(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.guardIcon}>👮</Text>
          <Text style={[styles.title, { color: colors.text }]}>Security Verification</Text>
          <Text style={[styles.sub, { color: colors.subtext }]}>
            Scan customer's QR receipt to verify payment
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => setScanning(true)}
          >
            <Text style={styles.btnText}>Scan QR Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Verifying...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  guardIcon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  btn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  scannerContainer: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#6C63FF', borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  scanHint: { color: '#fff', fontSize: 14, marginTop: 24, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  cancelBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25 },
  cancelText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
  resultIcon: { fontSize: 80, marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  resultSub: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  orderInfo: { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 16, alignItems: 'center' },
  orderInfoText: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
});
