import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';

import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import PaymentScreen from './screens/PaymentScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import OTPScreen from './screens/OTPScreen';
import QRReceiptScreen from './screens/QRReceiptScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import VerifyScreen from './screens/VerifyScreen';
import AdminScreen from './screens/AdminScreen';
import SplashScreen from './screens/SplashScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainApp() {
  const { colors } = useTheme();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          height: 60,
          paddingBottom: 8,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="scan-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="cart-outline" size={size} color={color} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#e74c3c',
            color: '#fff',
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="person-outline" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

function RootNav() {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{
        flex: 1, justifyContent: 'center',
        alignItems: 'center', backgroundColor: colors.primary
      }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainApp" component={MainApp} />
            <Stack.Screen
              name="QRReceipt"
              component={QRReceiptScreen}
              options={{
                headerShown: true,
                title: 'QR Receipt',
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="OrderHistory"
              component={OrderHistoryScreen}
              options={{
                headerShown: true,
                title: 'Order History',
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="Verify"
              component={VerifyScreen}
              options={{
                headerShown: true,
                title: 'Security Verify',
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{
                headerShown: true,
                title: 'Admin Panel',
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                headerShown: true,
                title: 'Product Details',
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Edit Profile',
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <RootNav />
      </CartProvider>
    </ThemeProvider>
  );
}