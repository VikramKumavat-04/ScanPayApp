import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { addToCart, cart } = useCart();
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const cartItem = cart.find(item => item.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    Alert.alert(
      'Added! ✅',
      `${quantity} x ${product.name} added to cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('Payment')
        }
      ]
    );
  };

  const getCategoryEmoji = (category) => {
    switch (category?.toLowerCase()) {
      case 'food': return '🍜';
      case 'snacks': return '🍟';
      case 'dairy': return '🥛';
      case 'beverages': return '🥤';
      case 'bakery': return '🍞';
      default: return '🛍️';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll}>

        <View style={[styles.imageSection, { backgroundColor: colors.primary }]}>
          <Text style={styles.productEmoji}>
            {getCategoryEmoji(product.category)}
          </Text>
          {cartItem && (
            <View style={styles.inCartBadge}>
              <Text style={styles.inCartText}>
                🛒 {cartItem.qty} in cart
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.detailCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <View style={styles.nameRow}>
            <Text style={[styles.productName, { color: colors.text }]}>
              {product.name}
            </Text>
            <Text style={[styles.categoryBadge, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>

          <Text style={[styles.productDesc, { color: colors.subtext }]}>
            {product.description}
          </Text>

          <View style={[styles.divider, { borderColor: colors.border }]} />

          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <Text style={styles.infoEmoji}>💰</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                ₹{product.price}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                Price
              </Text>
            </View>
            <View style={[styles.infoCard, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <Text style={styles.infoEmoji}>📦</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {product.stock}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                In Stock
              </Text>
            </View>
            <View style={[styles.infoCard, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <Text style={styles.infoEmoji}>🏷️</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}
                numberOfLines={1}
              >
                {product.category}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                Category
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { borderColor: colors.border }]} />

          <Text style={[styles.barcodeTitle, { color: colors.subtext }]}>
            Barcode
          </Text>
          <Text style={[styles.barcodeValue, { color: colors.text }]}>
            {product.barcode || 'N/A'}
          </Text>

        </View>

        <View style={[styles.qtyCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <Text style={[styles.qtyTitle, { color: colors.text }]}>
            Select Quantity
          </Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.qtyValue, { color: colors.text }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setQuantity(q => Math.min(product.stock, q + 1))}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.totalCalc, { color: colors.subtext }]}>
            Total: ₹{product.price * quantity}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, {
        backgroundColor: colors.card,
        borderTopColor: colors.border
      }]}>
        <View>
          <Text style={[styles.bottomLabel, { color: colors.subtext }]}>
            Total
          </Text>
          <Text style={[styles.bottomPrice, { color: colors.primary }]}>
            ₹{product.price * quantity}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addBtnText}>
            Add {quantity} to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  imageSection: {
    height: 220, justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: { fontSize: 100 },
  inCartBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  inCartText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  detailCard: {
    margin: 16, borderRadius: 16,
    padding: 20, borderWidth: 0.5, elevation: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 8,
  },
  categoryBadge: {
    fontSize: 12, backgroundColor: '#f0eeff',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, fontWeight: '600',
  },
  productDesc: { fontSize: 14, lineHeight: 20 },
  divider: { borderTopWidth: 0.5, marginVertical: 16 },
  infoGrid: {
    flexDirection: 'row', gap: 8,
  },
  infoCard: {
    flex: 1, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 0.5,
  },
  infoEmoji: { fontSize: 20, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: 'bold' },
  infoLabel: { fontSize: 11, marginTop: 2 },
  barcodeTitle: { fontSize: 12, marginBottom: 4 },
  barcodeValue: { fontSize: 14, fontWeight: '500', letterSpacing: 1 },
  qtyCard: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 20,
    borderWidth: 0.5, elevation: 2,
    alignItems: 'center',
  },
  qtyTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 16 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 24,
  },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  qtyValue: { fontSize: 28, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
  totalCalc: { fontSize: 14, marginTop: 12 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderTopWidth: 0.5, elevation: 8,
  },
  bottomLabel: { fontSize: 12 },
  bottomPrice: { fontSize: 22, fontWeight: 'bold' },
  addBtn: {
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 12,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});