import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Switch, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase';
import app from '../firebase';

const auth = getAuth(app);

export default function ProfileScreen({ navigation }) {
  const { colors, mode, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          const newUser = {
            phone: user.phoneNumber,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            totalOrders: 0,
            totalSpent: 0,
          };
          await setDoc(userRef, newUser);
          setUserData(newUser);
        }
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const getInitials = () => {
    const phone = user?.phoneNumber || '';
    return phone.slice(-2) || 'U';
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.headerName}>
          {userData?.name || 'ScanPay User'}
        </Text>
        <Text style={styles.headerPhone}>
          {user?.phoneNumber || '+91 XXXXXXXXXX'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {userData?.totalOrders || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>
            Total Orders
          </Text>
        </View>
        <View style={[styles.statCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            ₹{userData?.totalSpent || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>
            Total Spent
          </Text>
        </View>
        <View style={[styles.statCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {mode === 'dark' ? '🌙' : '☀️'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>
            {mode === 'dark' ? 'Dark' : 'Light'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
          PREFERENCES
        </Text>
        <View style={[styles.menuItem, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>
              {mode === 'dark' ? '🌙' : '☀️'}
            </Text>
            <Text style={[styles.menuText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
          ACCOUNT
        </Text>

        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={[styles.menuText, { color: colors.text }]}>
              My Orders
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.subtext }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={[styles.menuText, { color: colors.text }]}>
              Notifications
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.subtext }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🔐</Text>
            <Text style={[styles.menuText, { color: colors.text }]}>
              Privacy & Security
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.subtext }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
          onPress={() => navigation.navigate('Verify')}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>👮</Text>
            <Text style={[styles.menuText, { color: colors.text }]}>
              Security Verify
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.subtext }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
        >
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={[styles.menuText, { color: colors.text }]}>
              Help & Support
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.subtext }]}>›</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#e74c3c' }]}
          onPress={handleLogout}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.subtext }]}>
        ScanPay v1.0.0 • College Project
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: {
    padding: 32, alignItems: 'center', paddingBottom: 40,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerPhone: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16,
    marginTop: -20, marginBottom: 16, gap: 8,
  },
  statCard: {
    flex: 1, padding: 12, borderRadius: 12,
    alignItems: 'center', elevation: 4, borderWidth: 0.5,
  },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600',
    marginBottom: 8, marginLeft: 4, letterSpacing: 1,
  },
  menuItem: {
    padding: 16, borderRadius: 12, marginBottom: 8,
    elevation: 1, flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 0.5,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 20 },
  menuText: { fontSize: 15 },
  menuArrow: { fontSize: 20 },
  logoutBtn: {
    padding: 16, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderWidth: 1.5, backgroundColor: '#fff3f3',
  },
  logoutText: { fontSize: 15, color: '#e74c3c', fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, marginBottom: 32 },
});