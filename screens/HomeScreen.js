import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [userName, setUserName] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    fetchProducts();
    fetchUserName();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserName();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserName = async () => {
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().name) {
          setUserName(userSnap.data().name);
        } else {
          const phone = user.phoneNumber || '';
          setUserName('User ' + phone.slice(-4));
        }
      }
    } catch (error) {
      console.log('Error fetching user name:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), limit(20));
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 21) return '🌆';
    return '🌙';
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setRecentlyAdded(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev;
      return [product, ...prev].slice(0, 5);
    });
    showToast(`✅ ${product.name} added!`);
  };

  const handleViewDetail = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const recommended = products.filter(p => p.category === 'Food');
  const snacks = products.filter(p => p.category === 'Snacks');
  const dairy = products.filter(p => p.category === 'Dairy');

  const renderHorizontalCard = (product, emoji) => (
    <TouchableOpacity
      key={product.id}
      style={[styles.horizontalCard, {
        backgroundColor: colors.card,
        borderColor: colors.border
      }]}
      onPress={() => handleViewDetail(product)}
    >
      <Text style={styles.horizontalCardIcon}>{emoji}</Text>
      <Text
        style={[styles.horizontalCardName, { color: colors.text }]}
        numberOfLines={2}
      >
        {product.name}
      </Text>
      <Text style={[styles.horizontalCardPrice, { color: colors.primary }]}>
        ₹{product.price}
      </Text>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
        onPress={() => handleAddToCart(product)}
      >
        <Text style={styles.addBtnText}>+ Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage} visible={toastVisible} />
      <ScrollView style={styles.container}>

        <View style={[styles.banner, { backgroundColor: colors.banner }]}>
          <Text style={styles.bannerGreeting}>
            {getGreetingEmoji()} {getGreeting()}!
          </Text>
          <Text style={styles.bannerName}>
            {userName} 👋
          </Text>
          <Text style={styles.bannerSub}>
            Scan or tap to add products
          </Text>
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
              contentContainerStyle={styles.horizontalContent}
            >
              {recentlyAdded.map(product =>
                renderHorizontalCard(product, '🔁')
              )}
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
              contentContainerStyle={styles.horizontalContent}
            >
              {recommended.map(product =>
                renderHorizontalCard(product, '🍜')
              )}
            </ScrollView>
          </>
        )}

        {snacks.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🍟 Snacks
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
            >
              {snacks.map(product =>
                renderHorizontalCard(product, '🍟')
              )}
            </ScrollView>
          </>
        )}

        {dairy.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🥛 Dairy
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
            >
              {dairy.map(product =>
                renderHorizontalCard(product, '🥛')
              )}
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
        ) : products.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No products yet
            </Text>
          </View>
        ) : (
          products.map(product => (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, {
                backgroundColor: colors.card,
                borderColor: colors.border
              }]}
              onPress={() => handleViewDetail(product)}
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
                <TouchableOpacity
                  style={[styles.addBtn, {
                    backgroundColor: colors.primary, marginTop: 8
                  }]}
                  onPress={() => handleAddToCart(product)}
                >
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  banner: { padding: 24, margin: 16, borderRadius: 20 },
  bannerGreeting: {
    color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 2,
  },
  bannerName: {
    color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4,
  },
  cartPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, marginTop: 10, alignSelf: 'flex-start',
  },
  cartPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 8,
  },
  card: {
    borderRadius: 14, padding: 20,
    alignItems: 'center', width: '47%', elevation: 3,
  },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  horizontalContent: { paddingHorizontal: 16, paddingBottom: 8 },
  horizontalCard: {
    width: 130, borderRadius: 14,
    padding: 12, marginRight: 10,
    alignItems: 'center', elevation: 2, borderWidth: 0.5,
  },
  horizontalCardIcon: { fontSize: 28, marginBottom: 6 },
  horizontalCardName: {
    fontSize: 12, fontWeight: '600',
    textAlign: 'center', marginBottom: 4,
    width: '100%', minHeight: 32,
  },
  horizontalCardPrice: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  addBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  productCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', elevation: 2, borderWidth: 0.5,
  },
  productLeft: { flex: 1, marginRight: 8 },
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
  emptyBox: {
    margin: 16, borderRadius: 12,
    padding: 32, alignItems: 'center',
  },
  emptyText: { fontSize: 14 },
});