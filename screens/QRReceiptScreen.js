import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function QRReceiptScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { orderId, total, items, docId } = route.params;

  const handleShare = async () => {
    await Share.share({
      message: `ScanPay Receipt\nOrder ID: ${orderId}\nTotal: ₹${total}\nThank you for shopping!`,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>
          Payment Successful!
        </Text>
        <Text style={[styles.successSub, { color: colors.subtext }]}>
          Your order has been placed
        </Text>

        <View style={[styles.qrBox, { borderColor: colors.primary }]}>
          <Text style={styles.qrEmoji}>📱</Text>
          <Text style={[styles.qrText, { color: colors.text }]}>
            {orderId}
          </Text>
          <Text style={[styles.qrSub, { color: colors.subtext }]}>
            Show this to security at exit
          </Text>
        </View>

        <View style={[styles.divider, { borderColor: colors.border }]} />

        <View style={styles.orderDetails}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          {items.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={[styles.detailItem, { color: colors.subtext }]}>
                {item.name} x{item.qty}
              </Text>
              <Text style={[styles.detailPrice, { color: colors.text }]}>
                ₹{item.price * item.qty}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { borderColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Paid
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ₹{total}
            </Text>
          </View>
        </View>

      </View>

      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: colors.primary }]}
        onPress={handleShare}
      >
        <Text style={styles.shareBtnText}>Share Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.homeBtn, { borderColor: colors.primary }]}
        onPress={() => navigation.navigate('MainApp')}
      >
        <Text style={[styles.homeBtnText, { color: colors.primary }]}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16, padding: 24,
    borderWidth: 0.5, elevation: 3, marginBottom: 16,
  },
  successIcon: { alignItems: 'center', marginBottom: 8 },
  successEmoji: { fontSize: 56 },
  successTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  successSub: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  qrBox: {
    borderWidth: 2, borderRadius: 12,
    padding: 20, alignItems: 'center',
    marginBottom: 20, borderStyle: 'dashed',
  },
  qrEmoji: { fontSize: 48, marginBottom: 8 },
  qrText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  qrSub: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  divider: { borderTopWidth: 0.5, marginVertical: 12 },
  orderDetails: {},
  detailTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  detailItem: { fontSize: 13 },
  detailPrice: { fontSize: 13, fontWeight: '500' },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalAmount: { fontSize: 18, fontWeight: 'bold' },
  shareBtn: {
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginBottom: 10,
  },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  homeBtn: {
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5,
  },
  homeBtnText: { fontWeight: 'bold', fontSize: 15 },
});