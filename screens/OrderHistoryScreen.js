import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import app from '../firebase';
import { useTheme } from '../context/ThemeContext';

const auth = getAuth(app);

export default function OrderHistoryScreen({ navigation }) {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user?.uid),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (error) {
      console.log('Error fetching orders:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No orders yet
        </Text>
        <Text style={[styles.emptySub, { color: colors.subtext }]}>
          Your order history will appear here
        </Text>
        <TouchableOpacity
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, { color: colors.subtext }]}>
        {orders.length} order{orders.length > 1 ? 's' : ''} found
      </Text>

      {orders.map((order) => (
        <TouchableOpacity
          key={order.id}
          style={[styles.orderCard, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
          onPress={() => navigation.navigate('QRReceipt', {
            orderId: order.orderId,
            total: order.total,
            items: order.items,
            docId: order.id,
          })}
        >
          <View style={styles.orderTop}>
            <View>
              <Text style={[styles.orderId, { color: colors.primary }]}>
                {order.orderId}
              </Text>
              <Text style={[styles.orderDate, { color: colors.subtext }]}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <Text style={styles.statusText}>✅ Paid</Text>
            </View>
          </View>

          <View style={[styles.divider, { borderColor: colors.border }]} />

          <View style={styles.orderItems}>
            {order.items.slice(0, 2).map((item, index) => (
              <Text
                key={index}
                style={[styles.itemText, { color: colors.subtext }]}
              >
                • {item.name} x{item.qty} — ₹{item.price * item.qty}
              </Text>
            ))}
            {order.items.length > 2 && (
              <Text style={[styles.moreItems, { color: colors.primary }]}>
                +{order.items.length - 2} more items
              </Text>
            )}
          </View>

          <View style={styles.orderBottom}>
            <Text style={[styles.itemCount, { color: colors.subtext }]}>
              {order.items.reduce((t, i) => t + i.qty, 0)} items
            </Text>
            <Text style={[styles.orderTotal, { color: colors.primary }]}>
              ₹{order.total}
            </Text>
          </View>

          <Text style={[styles.viewReceipt, { color: colors.primary }]}>
            Tap to view QR receipt →
          </Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopBtn: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  headerText: {
    fontSize: 13, margin: 16, marginBottom: 8,
  },
  orderCard: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 14, padding: 16,
    borderWidth: 0.5, elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: { fontSize: 14, fontWeight: 'bold' },
  orderDate: { fontSize: 12, marginTop: 2 },
  orderStatus: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, color: '#27500A', fontWeight: '600' },
  divider: { borderTopWidth: 0.5, marginBottom: 10 },
  orderItems: { marginBottom: 10 },
  itemText: { fontSize: 13, marginBottom: 3 },
  moreItems: { fontSize: 12, marginTop: 2 },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: { fontSize: 13 },
  orderTotal: { fontSize: 20, fontWeight: 'bold' },
  viewReceipt: { fontSize: 12, textAlign: 'right' },
});