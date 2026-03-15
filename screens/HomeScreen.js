import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome to ScanPay</Text>
        <Text style={styles.bannerSub}>Scan products and pay instantly</Text>
      </View>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={styles.cardLabel}>Scan Product</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>💳</Text>
          <Text style={styles.cardLabel}>Make Payment</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardLabel}>My Orders</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🔐</Text>
          <Text style={styles.cardLabel}>QR Verify</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No transactions yet</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  banner: { backgroundColor: '#6C63FF', padding: 28, margin: 16, borderRadius: 16 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  bannerSub: { color: '#ddd', fontSize: 14, marginTop: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', width: '47%', elevation: 3 },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 16, marginTop: 8, marginBottom: 8, color: '#333' },
  emptyBox: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyText: { color: '#aaa', fontSize: 14 },
});