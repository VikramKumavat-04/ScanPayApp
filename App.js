import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import PaymentScreen from './screens/PaymentScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import OTPScreen from './screens/OTPScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', height: 60, paddingBottom: 8 },
        headerStyle: { backgroundColor: '#6C63FF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen name="Scan" component={ScanScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="scan-outline" size={size} color={color} /> }}
      />
      <Tab.Screen name="Payment" component={PaymentScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} /> }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} />
        <Stack.Screen name="MainApp" component={MainApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}