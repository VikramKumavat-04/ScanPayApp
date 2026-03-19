// screens/HomeScreen.js
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated, TextInput
} from 'react-native';
import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import ProductImage from '../components/ProductImage';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const user = auth.currentUser;
  const scaleAnims = useRef({});
  const heartAnims = useRef({});

  useEffect(() => {
    fetchProducts();
    fetchUserName();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserName);
    return unsubscribe;
  }, [navigation]);

  const fetchUserName = async () => {
    try {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().name) {
          setUserName(snap.data().name);
        } else {
          setUserName('User ' + (user.phoneNumber || '').slice(-4));
        }
      }
    } catch (e) { console.log(e); }
  };

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), limit(50)));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(data);
      data.forEach(p => {
        if (!scaleAnims.current[p.id]) scaleAnims.current[p.id] = new Animated.Value(1);
        if (!heartAnims.current[p.id]) heartAnims.current[p.id] = new Animated.Value(1);
      });
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 21) return 'Good Evening';
    return 'Good Night';
  };

  const getGreetingEmoji = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅';
    if (h < 17) return '☀️';
    if (h < 21) return '🌆';
    return '🌙';
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const goToCart = () => {
    navigation.navigate('MainApp', { screen: 'Payment' });
  };

  const handleAddToCart = (product) => {
    const anim = scaleAnims.current[product.id];
    if (anim) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.82, duration: 80, useNativeDriver: true }),
        Animated.spring(anim, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
      ]).start();
    }
    addToCart(product);
    showToast('✅ ' + product.name + ' added to cart!');
  };

  const toggleWishlist = (product) => {
    const anim = heartAnims.current[product.id];
    if (anim) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.5, duration: 150, useNativeDriver: true }),
        Animated.spring(anim, { toValue: 1, tension: 200, friction: 4, useNativeDriver: true }),
      ]).start();
    }
    const already = wishlist.find(w => w.id === product.id);
    if (already) {
      setWishlist(prev => prev.filter(w => w.id !== product.id));
      showToast('💔 Removed from wishlist');
    } else {
      setWishlist(prev => [...prev, product]);
      showToast('❤️ Added to wishlist!');
    }
  };

  const getDiscountedPrice = (product) => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.price * (1 - product.discount / 100));
    }
    return null;
  };

  const filtered = searchText.trim()
    ? products.filter(p =>
        p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchText.toLowerCase())
      )
    : products;

  const recommended = products.filter(p => p.category === 'Food');
  const snacks = products.filter(p => p.category === 'Snacks');
  const dairy = products.filter(p => p.category === 'Dairy');
  const beauty = products.filter(p => p.category === 'Beauty');

  const renderProductCard = (product) => {
    const scaleAnim = scaleAnims.current[product.id] || new Animated.Value(1);
    const heartAnim = heartAnims.current[product.id] || new Animated.Value(1);
    const isWishlisted = !!wishlist.find(w => w.id === product.id);
    const discountedPrice = getDiscountedPrice(product);

    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('ProductDetail', { product })}
        activeOpacity={0.85}
      >
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        )}
        <View style={styles.productLeft}>
          <ProductImage product={product} size={60} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.productDesc, { color: colors.subtext }]} numberOfLines={1}>
              {product.description}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.productPrice, { color: colors.primary }]}>
                ₹{discountedPrice || product.price}
              </Text>
              {discountedPrice && (
                <Text style={styles.originalPrice}>₹{product.price}</Text>
              )}
            </View>
            <Text style={[styles.productCategory, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>
        </View>
        <View style={styles.productRight}>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={styles.heartBtn}
            >
              <Text style={styles.heartIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.productStock, { color: colors.subtext }]}>
            Stock: {product.stock}
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 8 }}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleAddToCart(product)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHorizontalCard = (product) => {
    const scaleAnim = scaleAnims.current[product.id] || new Animated.Value(1);
    const discountedPrice = getDiscountedPrice(product);
    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.horizontalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('ProductDetail', { product })}
        activeOpacity={0.85}
      >
        {product.discount > 0 && (
          <View style={styles.hDiscountBadge}>
            <Text style={styles.hDiscountText}>{product.discount}%</Text>
          </View>
        )}
        <ProductImage product={product} size={80} style={{ marginBottom: 8 }} />
        <Text style={[styles.horizontalCardName, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.horizontalCardPrice, { color: colors.primary }]}>
          ₹{discountedPrice || product.price}
        </Text>
        {discountedPrice && (
          <Text style={styles.hOriginalPrice}>₹{product.price}</Text>
        )}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.hAddBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleAddToCart(product)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage} visible={toastVisible} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!searchText && (
          <View style={[styles.banner, { backgroundColor: colors.banner }]}>
            <Text style={styles.bannerGreeting}>{getGreetingEmoji()} {getGreeting()}!</Text>
            <Text style={styles.bannerName}>{userName} 👋</Text>
            <Text style={styles.bannerSub}>Scan or tap to add products</Text>
            {getTotalItems() > 0 && (
              <TouchableOpacity
                style={styles.cartPill}
                onPress={goToCart}
              >
                <Text style={styles.cartPillText}>
                  🛒 {getTotalItems()} items in cart → Pay now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Search bar */}
        <View style={[styles.searchBar, {
          backgroundColor: colors.card,
          borderColor: searchText ? colors.primary : colors.border
        }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products, categories..."
            placeholderTextColor={colors.subtext}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={[styles.clearBtn, { color: colors.subtext }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchText.trim() ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🔎 "{searchText}" — {filtered.length} results
            </Text>
            {filtered.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
                <Text style={{ fontSize: 40 }}>😕</Text>
                <Text style={[styles.emptyText, { color: colors.subtext }]}>
                  No products found
                </Text>
              </View>
            ) : (
              filtered.map(p => renderProductCard(p))
            )}
          </>
        ) : (
          <>
            {/* Quick actions */}
            <View style={styles.cardRow}>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('Scan')}
              >
                <Text style={styles.cardIcon}>📷</Text>
                <Text style={[styles.cardLabel, { color: colors.text }]}>Scan Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={goToCart}
              >
                <Text style={styles.cardIcon}>🛒</Text>
                <Text style={[styles.cardLabel, { color: colors.text }]}>
                  My Cart {getTotalItems() > 0 ? '(' + getTotalItems() + ')' : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Wishlist */}
            {wishlist.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>❤️ Your Wishlist</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                  {wishlist.map(p => renderHorizontalCard(p))}
                </ScrollView>
              </>
            )}

            {recommended.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ Recommended</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                  {recommended.map(p => renderHorizontalCard(p))}
                </ScrollView>
              </>
            )}

            {snacks.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🍟 Snacks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                  {snacks.map(p => renderHorizontalCard(p))}
                </ScrollView>
              </>
            )}

            {dairy.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🥛 Dairy</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                  {dairy.map(p => renderHorizontalCard(p))}
                </ScrollView>
              </>
            )}

            {beauty.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>💄 Beauty</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
                  {beauty.map(p => renderHorizontalCard(p))}
                </ScrollView>
              </>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>🛍️ All Products</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : products.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.subtext }]}>No products yet</Text>
              </View>
            ) : (
              products.map(p => renderProductCard(p))
            )}
          </>
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
  bannerGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 2 },
  bannerName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  cartPill: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    marginTop: 10, alignSelf: 'flex-start',
  },
  cartPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12, marginTop: 4,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: { fontSize: 16, paddingLeft: 8 },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 8,
  },
  card: { borderRadius: 14, padding: 20, alignItems: 'center', width: '47%', elevation: 3 },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  horizontalContent: { paddingHorizontal: 16, paddingBottom: 8 },
  horizontalCard: {
    width: 135, borderRadius: 14, padding: 12,
    marginRight: 10, alignItems: 'center', elevation: 2, borderWidth: 0.5,
  },
  hDiscountBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#e74c3c', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  hDiscountText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  horizontalCardName: {
    fontSize: 12, fontWeight: '600', textAlign: 'center',
    marginBottom: 4, minHeight: 32,
  },
  horizontalCardPrice: { fontSize: 14, fontWeight: 'bold' },
  hOriginalPrice: {
    fontSize: 11, color: '#aaa',
    textDecorationLine: 'line-through', marginBottom: 6,
  },
  hAddBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  productCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', elevation: 2, borderWidth: 0.5,
  },
  discountBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: '#e74c3c', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, zIndex: 1,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  productLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  productName: { fontSize: 14, fontWeight: 'bold' },
  productDesc: { fontSize: 11, marginTop: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  productPrice: { fontSize: 16, fontWeight: 'bold' },
  originalPrice: { fontSize: 12, color: '#aaa', textDecorationLine: 'line-through' },
  productCategory: {
    fontSize: 10, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 20, marginTop: 4, alignSelf: 'flex-start',
    backgroundColor: '#f0eeff',
  },
  productRight: { alignItems: 'flex-end' },
  heartBtn: { padding: 4 },
  heartIcon: { fontSize: 20 },
  productStock: { fontSize: 10, marginTop: 4 },
  addBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  emptyBox: {
    margin: 16, borderRadius: 12, padding: 32,
    alignItems: 'center', gap: 8,
  },
  emptyText: { fontSize: 14 },
});