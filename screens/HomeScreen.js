import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import app from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const auth = getAuth(app);

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
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

  const handleAddToCart = (product) => {
    addToCart(product);
    setRecentlyAdded(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev;
      return [product, ...prev].slice(0, 5);
    });
    Alert.alert('Added! ✅', `${product.name} added to cart!`);
  };

  const recommended = products.filter(p => p.category === 'Food');
  const dairy = products.filter(p => p.category === 'Dairy');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.banner, { backgroundColor: colors.banner }]}>
        <Text style={styles.bannerHello}>Hello! 👋</Text>
        <Text style={styles.bannerTitle}>Welcome to ScanPay</Text>
        <Text style={styles.bannerSub}>Scan or tap to add products</Text>
        {getTotalItems() > 0 && (
          <TouchableOpacity
            style={styles.cartPill}
            onPress={() => navigation.navigate('Payment')}
          >
            <Text style={styles.cartPillText}>
              🛒 {getTotalItems()} items in cart → Pay now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.cardIcon}>📷</Text>
          <Text style={[styles.cardLabel, { color: colors.text }]}>
            Scan Product
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Payment')}
        >
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={[styles.cardLabel, { color: colors.text }]}>
            My Cart {getTotalItems() > 0 ? `(${getTotalItems()})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {recentlyAdded.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🕐 Recently Added
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {recentlyAdded.map(product => (
              <TouchableOpacity
                key={product.id}
                style={[styles.horizontalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAddToCart(product)}
              >
                <Text style={styles.horizontalCardIcon}>🔁</Text>
                <Text style={[styles.horizontalCardName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text style={[styles.horizontalCardPrice, { color: colors.primary }]}>
                  ₹{product.price}
                </Text>
                <View style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {recommended.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⭐ Recommended
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {recommended.map(product => (
              <TouchableOpacity
                key={product.id}
                style={[styles.horizontalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAddToCart(product)}
              >
                <Text style={styles.horizontalCardIcon}>🛍️</Text>
                <Text
                  style={[styles.horizontalCardName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text style={[styles.horizontalCardPrice, { color: colors.primary }]}>
                  ₹{product.price}
                </Text>
                <View style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {dairy.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🥛 Dairy Products
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {dairy.map(product => (
              <TouchableOpacity
                key={product.id}
                style={[styles.horizontalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAddToCart(product)}
              >
                <Text style={styles.horizontalCardIcon}>🥛</Text>
                <Text
                  style={[styles.horizontalCardName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text style={[styles.horizontalCardPrice, { color: colors.primary }]}>
                  ₹{product.price}
                </Text>
                <View style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

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
            style={[styles.productCard, {
              backgroundColor: colors.card,
              borderColor: colors.border
            }]}
            onPress={() => handleAddToCart(product)}
          >
            <View style={styles.productLeft}>
              <Text style={[styles.productName, { color: colors.text }]}>
                {product.name}
              </Text>
              <Text style={[styles.productDesc, { color: colors.subtext }]}>
                {product.description}
              </Text>
              <Text style={[styles.productCategory, { color: colors.primary }]}>
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
              <View style={[styles.addBtn, { backgroundColor: colors.primary, marginTop: 8 }]}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { padding: 28, margin: 16, borderRadius: 16 },
  bannerHello: { color: '#ddd', fontSize: 14 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  bannerSub: { color: '#ddd', fontSize: 14, marginTop: 4 },
  cartPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, marginTop: 12,
    alignSelf: 'flex-start',
  },
  cartPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 12,
  },
  card: {
    borderRadius: 12, padding: 20,
    alignItems: 'center', width: '47%', elevation: 3,
  },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  horizontalScroll: { paddingLeft: 16, marginBottom: 8 },
  horizontalCard: {
    width: 130, borderRadius: 12,
    padding: 12, marginRight: 10,
    alignItems: 'center', elevation: 2,
    borderWidth: 0.5,
  },
  horizontalCardIcon: { fontSize: 28, marginBottom: 6 },
  horizontalCardName: {
    fontSize: 12, fontWeight: '600',
    textAlign: 'center', marginBottom: 4, width: '100%',
  },
  horizontalCardPrice: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  addBtn: {
    borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 5,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  productCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, borderWidth: 0.5,
  },
  productLeft: { flex: 1 },
  productName: { fontSize: 15, fontWeight: 'bold' },
  productDesc: { fontSize: 12, marginTop: 2 },
  productCategory: {
    fontSize: 11, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 20,
    marginTop: 4, alignSelf: 'flex-start',
    backgroundColor: '#f0eeff',
  },
  productRight: { alignItems: 'flex-end' },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  productStock: { fontSize: 11, marginTop: 2 },
});