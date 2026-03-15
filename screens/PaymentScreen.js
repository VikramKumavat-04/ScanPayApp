import { View, Text, StyleSheet } from 'react-native';

export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💳</Text>
      <Text style={styles.title}>Payments</Text>
      <Text style={styles.sub}>Your cart and payment options will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  sub: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
});