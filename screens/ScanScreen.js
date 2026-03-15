import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.scanBox}>
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanTitle}>Scan a Product</Text>
        <Text style={styles.scanSub}>Point your camera at a barcode or QR code</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  scanBox: { backgroundColor: '#fff', borderRadius: 16, padding: 36, alignItems: 'center', margin: 24, elevation: 3 },
  scanIcon: { fontSize: 48, marginBottom: 16 },
  scanTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  scanSub: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  button: { backgroundColor: '#6C63FF', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});