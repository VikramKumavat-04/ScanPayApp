import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import app from '../firebase';

const auth = getAuth(app);

export default function HomeScreen({ navigation }) {
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
    <ScrollView style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerHello}>Hello! 👋</Text>
        <Text style={styles.bannerTitle}>Welcome to ScanPay</Text>
        <Text style={styles.bannerSub}>Scan products and pay instantly</Text>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity style={styles.card}
          onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={styles.cardLabel}>Scan Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}
          onPress={() => navigation.navigate('Payment')}>
          <Text style={styles.cardIcon}>💳</Text>
          <Text style={styles.cardLabel}>Make Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardLabel}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>🔐</Text>
          <Text style={styles.cardLabel}>QR Verify</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>🛍️ All Products</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 20 }} />
      ) : (
        products.map(product => (
          <TouchableOpacity key={product.id} style={styles.productCard}>
            <View style={styles.productLeft}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDesc}>{product.description}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <View style={styles.productRight}>
              <Text style={styles.productPrice}>₹{product.price}</Text>
              <Text style={styles.productStock}>Stock: {product.stock}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  banner: {
    backgroundColor: '#6C63FF',
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
    backgroundColor: '#fff', borderRadius: 12,
    padding: 20, alignItems: 'center', width: '47%', elevation: 3,
  },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 8, marginBottom: 8, color: '#333',
  },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  productLeft: { flex: 1 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  productDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  productCategory: {
    fontSize: 11, color: '#6C63FF',
    backgroundColor: '#f0eeff',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, marginTop: 4,
    alignSelf: 'flex-start',
  },
  productRight: { alignItems: 'flex-end' },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#6C63FF' },
  productStock: { fontSize: 11, color: '#888', marginTop: 2 },
});