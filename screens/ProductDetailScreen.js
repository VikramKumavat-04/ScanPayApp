// screens/ProductDetailScreen.js
import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';

export default function ProductDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { addToCart, removeFromCart, increaseQty, decreaseQty, cart } = useCart();
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const goToCart = () => {
    navigation.navigate('MainApp', { screen: 'Payment' });
  };

  const handleAddToCart = () => {
    if (isInCart) {
      goToCart();
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const getDiscountedPrice = () => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.price * (1 - product.discount / 100));
    }
    return null;
  };

  const discountedPrice = getDiscountedPrice();
  const finalPrice = discountedPrice || product.price;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll}>

        {/* Image section */}
        <View style={[styles.imageSection, { backgroundColor: colors.primary }]}>
          <ProductImage
            product={product}
            size={180}
            style={{ borderRadius: 20 }}
          />
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
          {isInCart && (
            <View style={styles.inCartBadge}>
              <Text style={styles.inCartText}>🛒 {cartItem.qty} in cart</Text>
            </View>
          )}
        </View>

        {/* Detail card */}
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

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <Text style={styles.infoEmoji}>💰</Text>
              {discountedPrice ? (
                <>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    ₹{discountedPrice}
                  </Text>
                  <Text style={styles.strikePrice}>₹{product.price}</Text>
                </>
              ) : (
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  ₹{product.price}
                </Text>
              )}
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Price</Text>
            </View>

            <View style={[styles.infoCard, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <Text style={styles.infoEmoji}>📦</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {product.stock}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>In Stock</Text>
            </View>

            <View style={[styles.infoCard, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <Text style={styles.infoEmoji}>🏷️</Text>
              <Text
                style={[styles.infoValue, { color: colors.primary }]}
                numberOfLines={1}
              >
                {product.category}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Category</Text>
            </View>
          </View>

          <View style={[styles.divider, { borderColor: colors.border }]} />

          <Text style={[styles.barcodeTitle, { color: colors.subtext }]}>Barcode</Text>
          <Text style={[styles.barcodeValue, { color: colors.text }]}>
            {product.barcode || 'N/A'}
          </Text>
        </View>

        {/* Quantity selector — only show if NOT in cart */}
        {!isInCart && (
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
              Total: ₹{finalPrice * quantity}
            </Text>
          </View>
        )}

        {/* In cart quantity control — show if already in cart */}
        {isInCart && (
          <View style={[styles.qtyCard, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Text style={[styles.qtyTitle, { color: '#27ae60' }]}>
              ✅ Added to Cart
            </Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: '#e74c3c' }]}
                onPress={() => decreaseQty(product.id)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyValue, { color: colors.text }]}>
                {cartItem.qty}
              </Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                onPress={() => increaseQty(product.id)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.totalCalc, { color: colors.subtext }]}>
              Cart Total: ₹{finalPrice * cartItem.qty}
            </Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeFromCart(product.id)}
            >
              <Text style={styles.removeBtnText}>🗑️ Remove from Cart</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom bar */}
   {/* Bottom bar */}
<View style={[styles.bottomBar, {
  backgroundColor: colors.card,
  borderTopColor: colors.border
}]}>
  <View style={styles.priceSection}>
    <Text style={[styles.bottomLabel, { color: colors.subtext }]}>
      {isInCart ? 'In Cart' : 'Total'}
    </Text>
    <Text style={[styles.bottomPrice, { color: colors.primary }]}>
      ₹{isInCart ? finalPrice * cartItem.qty : finalPrice * quantity}
    </Text>
  </View>

  <TouchableOpacity
    style={[styles.addBtn, {
      backgroundColor: isInCart ? '#27ae60' : colors.primary
    }]}
    onPress={handleAddToCart}
    activeOpacity={0.85}
  >
    <Text style={styles.addBtnText}>
      {isInCart ? '✅ Go to Cart' : `Add ${quantity} to Cart`}
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
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
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
  productName: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 8 },
  categoryBadge: {
    fontSize: 12, backgroundColor: '#f0eeff',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, fontWeight: '600',
  },
  productDesc: { fontSize: 14, lineHeight: 20 },
  divider: { borderTopWidth: 0.5, marginVertical: 16 },
  infoGrid: { flexDirection: 'row', gap: 8 },
  infoCard: {
    flex: 1, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 0.5,
  },
  infoEmoji: { fontSize: 20, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: 'bold' },
  strikePrice: {
    fontSize: 11, color: '#aaa',
    textDecorationLine: 'line-through',
  },
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
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  qtyValue: {
    fontSize: 28, fontWeight: 'bold',
    minWidth: 40, textAlign: 'center',
  },
  totalCalc: { fontSize: 14, marginTop: 12 },
  removeBtn: {
    marginTop: 12, paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: '#fff3f3',
  },
  removeBtnText: { color: '#e74c3c', fontSize: 13, fontWeight: '500' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 10,
    borderTopWidth: 0.5, elevation: 8,
  },
  goCartBtn: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  goCartIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute', top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  priceSection: { flex: 1, alignItems: 'center' },
  bottomLabel: { fontSize: 11 },
  bottomPrice: { fontSize: 22, fontWeight: 'bold' },
  addBtn: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});