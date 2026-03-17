// components/ProductImage.js
import { View, Text, StyleSheet } from 'react-native';

const getInfo = (cat) => {
  switch (cat?.toLowerCase()) {
    case 'food': return { emoji: '🍜', bg: '#FFF3E0', border: '#FFB74D' };
    case 'snacks': return { emoji: '🍟', bg: '#FFF8E1', border: '#FFD54F' };
    case 'dairy': return { emoji: '🥛', bg: '#E3F2FD', border: '#64B5F6' };
    case 'beverages': return { emoji: '🥤', bg: '#E8F5E9', border: '#81C784' };
    case 'bakery': return { emoji: '🍞', bg: '#FCE4EC', border: '#F48FB1' };
    case 'beauty': return { emoji: '💄', bg: '#F3E5F5', border: '#CE93D8' };
    case 'household': return { emoji: '🏠', bg: '#E0F2F1', border: '#80CBC4' };
    default: return { emoji: '🛍️', bg: '#F5F5F5', border: '#E0E0E0' };
  }
};

export default function ProductImage({ product, size = 60, style }) {
  const { emoji, bg, border } = getInfo(product?.category);
  return (
    <View style={[{
      width: size, height: size,
      borderRadius: size * 0.22,
      backgroundColor: bg,
      borderWidth: 1.5,
      borderColor: border,
      justifyContent: 'center',
      alignItems: 'center',
    }, style]}>
      <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>
    </View>
  );
}