import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

export default function PaymentScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    cart, increaseQty, decreaseQty,
    removeFromCart, clearCart,
    getTotalAmount, getTotalItems
  } = useCart();
  const [loading, setLoading] = useState(false);

  const TAX_RATE = 0.05;
  const subtotal = getTotalAmount();
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handlePayment = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart first!');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const orderId = `ORD${Date.now()}`;
      const cartSnapshot = [...cart];
      const orderData = {
        userId: user?.uid,
        phone: user?.phoneNumber,
        items: cartSnapshot,
        subtotal,
        tax,
        total,
        status: 'paid',
        createdAt: new Date().toISOString(),
        orderId,
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      setLoading(false);
      Alert.alert(
        '🎉 Payment Successful!',
        `Order placed!\nOrder ID: ${orderId}\nTotal: ₹${total}`,
        [
          {
            text: 'View QR Receipt',
            onPress: () => navigation.navigate('QRReceipt', {
              orderId,
              total,
              items: cartSnapshot,
              docId: docRef.id,
            })
          }
        ]
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Your cart is empty
        </Text>
        <Text style={[styles.emptySub, { color: colors.subtext }]}>
          Scan products or tap + on Home screen
        </Text>
        <TouchableOpacity
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll}>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🛒 Your Cart ({getTotalItems()} items)
        </Text>

        {cart.map((item) => (
          <View
            key={item.id}
            style={[styles.cartItem, {
              backgroundColor: colors.card,
              borderColor: colors.border
            }]}
          >
            <View style={styles.itemLeft}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemDesc, { color: colors.subtext }]}>
                {item.description}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                ₹{item.price} each
              </Text>
            </View>

            <View style={styles.itemRight}>
              <Text style={[styles.itemTotal, { color: colors.primary }]}>
                ₹{item.price * item.qty}
              </Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => decreaseQty(item.id)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>
                  {item.qty}
                </Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => increaseQty(item.id)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={[styles.billCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <Text style={[styles.billTitle, { color: colors.text }]}>
            🧾 Bill Summary
          </Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.subtext }]}>
              Subtotal
            </Text>
            <Text style={[styles.billValue, { color: colors.text }]}>
              ₹{subtotal}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.subtext }]}>
              GST (5%)
            </Text>
            <Text style={[styles.billValue, { color: colors.text }]}>
              ₹{tax}
            </Text>
          </View>
          <View style={[styles.billDivider, { borderColor: colors.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.billTotal, { color: colors.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.billTotalAmount, { color: colors.primary }]}>
              ₹{total}
            </Text>
          </View>
        </View>

        <View style={[styles.paymentMethods, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <Text style={[styles.billTitle, { color: colors.text }]}>
            💳 Payment Method
          </Text>
          <View style={[styles.methodSelected, { borderColor: colors.primary }]}>
            <Text style={styles.methodIcon}>📱</Text>
            <Text style={[styles.methodText, { color: colors.text }]}>
              UPI / Mock Payment
            </Text>
            <Text style={[styles.methodCheck, { color: colors.primary }]}>✓</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, {
        backgroundColor: colors.card,
        borderTopColor: colors.border
      }]}>
        <View>
          <Text style={[styles.bottomTotal, { color: colors.subtext }]}>
            Total
          </Text>
          <Text style={[styles.bottomAmount, { color: colors.primary }]}>
            ₹{total}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: colors.primary }]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>
              Pay ₹{total}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  emptyContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 32,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopBtn: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    margin: 16, marginBottom: 10,
  },
  cartItem: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0.5, elevation: 2,
  },
  itemLeft: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: 'bold' },
  itemDesc: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 13, marginTop: 4 },
  itemRight: { alignItems: 'flex-end' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  qtyText: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
  removeText: { fontSize: 12, color: '#e74c3c' },
  billCard: {
    margin: 16, borderRadius: 12,
    padding: 16, borderWidth: 0.5, elevation: 2,
  },
  billTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  billRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: { fontSize: 14 },
  billValue: { fontSize: 14 },
  billDivider: { borderTopWidth: 1, marginVertical: 10 },
  billTotal: { fontSize: 16, fontWeight: 'bold' },
  billTotalAmount: { fontSize: 20, fontWeight: 'bold' },
  paymentMethods: {
    margin: 16, borderRadius: 12,
    padding: 16, borderWidth: 0.5, elevation: 2,
  },
  methodSelected: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10,
    borderWidth: 1.5, marginTop: 8, gap: 10,
  },
  methodIcon: { fontSize: 20 },
  methodText: { flex: 1, fontSize: 14, fontWeight: '500' },
  methodCheck: { fontSize: 18, fontWeight: 'bold' },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderTopWidth: 0.5, elevation: 8,
  },
  bottomTotal: { fontSize: 12 },
  bottomAmount: { fontSize: 22, fontWeight: 'bold' },
  payBtn: {
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 12, minWidth: 120, alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});