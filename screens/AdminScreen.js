import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, Alert
} from 'react-native';
import {
  collection, getDocs, addDoc,
  deleteDoc, doc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', barcode: '',
    description: '', category: '', stock: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.barcode) {
      Alert.alert('Error', 'Name, price and barcode are required!');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        barcode: newProduct.barcode,
        description: newProduct.description || '',
        category: newProduct.category || 'General',
        stock: parseInt(newProduct.stock) || 100,
      });
      Alert.alert('Success!', 'Product added successfully!');
      setNewProduct({
        name: '', price: '', barcode: '',
        description: '', category: '', stock: ''
      });
      setShowAddProduct(false);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Could not add product.');
    }
    setLoading(false);
  };

  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));
              fetchProducts();
              Alert.alert('Deleted!', 'Product removed.');
            } catch (error) {
              Alert.alert('Error', 'Could not delete product.');
            }
          }
        }
      ]
    );
  };

  const handleUpdatePrice = async (productId, newPrice) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        price: parseFloat(newPrice)
      });
      fetchProducts();
      Alert.alert('Updated!', 'Price updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not update price.');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {['dashboard', 'products', 'orders'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? '#fff' : colors.subtext }
            ]}>
              {tab === 'dashboard' ? '📊' : tab === 'products' ? '📦' : '📋'}
              {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>

        {activeTab === 'dashboard' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Admin Dashboard
            </Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.statEmoji}>📦</Text>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {totalProducts}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>
                  Products
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.statEmoji}>📋</Text>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {totalOrders}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>
                  Orders
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.statEmoji}>💰</Text>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  ₹{totalRevenue}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>
                  Revenue
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🕐 Recent Orders
            </Text>
            {orders.slice(0, 5).map((order, index) => (
              <View
                key={index}
                style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.orderId, { color: colors.primary }]}>
                  {order.orderId}
                </Text>
                <Text style={[styles.orderInfo, { color: colors.subtext }]}>
                  {order.items?.length} items • ₹{order.total}
                </Text>
                <Text style={[styles.orderDate, { color: colors.subtext }]}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'products' && (
          <View>
            <View style={styles.productsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Products ({totalProducts})
              </Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddProduct(!showAddProduct)}
              >
                <Text style={styles.addBtnText}>
                  {showAddProduct ? '✕ Cancel' : '+ Add'}
                </Text>
              </TouchableOpacity>
            </View>

            {showAddProduct && (
              <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Add New Product
                </Text>
                {[
                  { key: 'name', placeholder: 'Product name *', keyboard: 'default' },
                  { key: 'barcode', placeholder: 'Barcode number *', keyboard: 'number-pad' },
                  { key: 'price', placeholder: 'Price (₹) *', keyboard: 'number-pad' },
                  { key: 'description', placeholder: 'Description', keyboard: 'default' },
                  { key: 'category', placeholder: 'Category (Food, Snacks...)', keyboard: 'default' },
                  { key: 'stock', placeholder: 'Stock quantity', keyboard: 'number-pad' },
                ].map(field => (
                  <TextInput
                    key={field.key}
                    style={[styles.input, {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    }]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.subtext}
                    keyboardType={field.keyboard}
                    value={newProduct[field.key]}
                    onChangeText={text =>
                      setNewProduct(prev => ({ ...prev, [field.key]: text }))
                    }
                  />
                ))}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddProduct}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Product</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {products.map((product) => (
              <View
                key={product.id}
                style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.productTop}>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productBarcode, { color: colors.subtext }]}>
                      🔢 {product.barcode}
                    </Text>
                    <Text style={[styles.productCategory, { color: colors.primary }]}>
                      {product.category}
                    </Text>
                  </View>
                  <View style={styles.productActions}>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                      ₹{product.price}
                    </Text>
                    <Text style={[styles.productStock, { color: colors.subtext }]}>
                      Stock: {product.stock}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.editBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                      Alert.prompt(
                        'Update Price',
                        `Enter new price for ${product.name}`,
                        (newPrice) => {
                          if (newPrice) handleUpdatePrice(product.id, newPrice);
                        },
                        'plain-text',
                        product.price.toString()
                      );
                    }}
                  >
                    <Text style={[styles.editBtnText, { color: colors.primary }]}>
                      ✏️ Edit Price
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'orders' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              All Orders ({totalOrders})
            </Text>
            {orders.map((order, index) => (
              <View
                key={index}
                style={[styles.orderDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.orderHeader}>
                  <Text style={[styles.orderId, { color: colors.primary }]}>
                    {order.orderId}
                  </Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>✅ Paid</Text>
                  </View>
                </View>
                <Text style={[styles.orderPhone, { color: colors.subtext }]}>
                  📱 {order.phone}
                </Text>
                {order.items?.map((item, i) => (
                  <Text key={i} style={[styles.orderItem, { color: colors.subtext }]}>
                    • {item.name} x{item.qty} — ₹{item.price * item.qty}
                  </Text>
                ))}
                <View style={[styles.orderFooter, { borderColor: colors.border }]}>
                  <Text style={[styles.orderDate, { color: colors.subtext }]}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                  <Text style={[styles.orderTotal, { color: colors.primary }]}>
                    ₹{order.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: 'row', padding: 8,
    margin: 16, borderRadius: 12,
    borderWidth: 0.5, gap: 4,
  },
  tab: {
    flex: 1, paddingVertical: 8,
    borderRadius: 8, alignItems: 'center',
  },
  tabText: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 8, marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row', marginHorizontal: 16,
    marginBottom: 16, gap: 8,
  },
  statCard: {
    flex: 1, padding: 12, borderRadius: 12,
    alignItems: 'center', borderWidth: 0.5, elevation: 2,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 2 },
  orderCard: {
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 12,
    borderWidth: 0.5,
  },
  orderId: { fontSize: 13, fontWeight: 'bold' },
  orderInfo: { fontSize: 12, marginTop: 2 },
  orderDate: { fontSize: 11, marginTop: 2 },
  productsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginHorizontal: 16,
    marginTop: 8, marginBottom: 12,
  },
  addBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  addForm: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 12, padding: 16, borderWidth: 0.5,
  },
  formTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1, borderRadius: 10,
    padding: 12, fontSize: 14,
    marginBottom: 10,
  },
  saveBtn: {
    borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  productCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16, borderWidth: 0.5,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: 'bold' },
  productBarcode: { fontSize: 11, marginTop: 2 },
  productCategory: {
    fontSize: 11, marginTop: 4,
    backgroundColor: '#f0eeff',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  productActions: { alignItems: 'flex-end' },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  productStock: { fontSize: 11, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1, borderWidth: 1, borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  editBtnText: { fontSize: 13, fontWeight: '500' },
  deleteBtn: {
    flex: 1, backgroundColor: '#fff3f3',
    borderRadius: 8, paddingVertical: 8, alignItems: 'center',
  },
  deleteBtnText: { fontSize: 13, color: '#e74c3c', fontWeight: '500' },
  orderDetailCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16, borderWidth: 0.5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paidBadge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20,
  },
  paidText: { fontSize: 11, color: '#27500A', fontWeight: '600' },
  orderPhone: { fontSize: 12, marginBottom: 8 },
  orderItem: { fontSize: 12, marginBottom: 3 },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 0.5, marginTop: 8, paddingTop: 8,
  },
  orderTotal: { fontSize: 16, fontWeight: 'bold' },
});