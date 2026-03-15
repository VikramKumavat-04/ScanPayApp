import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import app from '../firebase';
import { useTheme } from '../context/ThemeContext';

const auth = getAuth(app);

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), limit(10));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(data);
    } catch (error) {
      console.log('Error fetching products:', error);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.banner, { backgroundColor: colors.banner }]}>
        <Text style={styles.bannerHello}>Hello! 👋</Text>
        <Text style={styles.bannerTitle}>Welcome to ScanPay</Text>
        <Text style={styles.bannerSub}>Scan products and pay instantly</Text>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Scan Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Payment')}
        >
          <Text style={styles.cardIcon}>💳</Text>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Make Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={[styles.cardLabel, { color: colors.text }]}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.cardIcon}>🔐</Text>
          <Text style={[styles.cardLabel, { color: colors.text }]}>QR Verify</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🛍️ All Products
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        products.map(product => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.productLeft}>
              <Text style={[styles.productName, { color: colors.text }]}>
                {product.name}
              </Text>
              <Text style={[styles.productDesc, { color: colors.subtext }]}>
                {product.description}
              </Text>
              <Text style={[styles.productCategory, { color: colors.primary, backgroundColor: colors.background }]}>
                {product.category}
              </Text>
            </View>
            <View style={styles.productRight}>
              <Text style={[styles.productPrice, { color: colors.primary }]}>
                ₹{product.price}
              </Text>
              <Text style={[styles.productStock, { color: colors.subtext }]}>
                Stock: {product.stock}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    padding: 28, margin: 16, borderRadius: 16,
  },
  bannerHello: { color: '#ddd', fontSize: 14 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  bannerSub: { color: '#ddd', fontSize: 14, marginTop: 4 },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 12,
  },
  card: {
    borderRadius: 12, padding: 20,
    alignItems: 'center', width: '47%', elevation: 3,
  },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
  },
  productCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 0.5,
  },
  productLeft: { flex: 1 },
  productName: { fontSize: 15, fontWeight: 'bold' },
  productDesc: { fontSize: 12, marginTop: 2 },
  productCategory: {
    fontSize: 11,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, marginTop: 4,
    alignSelf: 'flex-start',
  },
  productRight: { alignItems: 'flex-end' },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  productStock: { fontSize: 11, marginTop: 2 },
});