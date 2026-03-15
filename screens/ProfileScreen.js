
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>V</Text>
      </View>
      <Text style={styles.name}>Vikram Kumavat</Text>
      <Text style={styles.phone}>+91 XXXXXXXXXX</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📋  My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🔔  Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>⚙️  Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.logout]}>
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', paddingTop: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  phone: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 24 },
  menu: { width: '90%' },
  menuItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  menuText: { fontSize: 15, color: '#333' },
  logout: { backgroundColor: '#fff3f3' },
  logoutText: { fontSize: 15, color: '#e74c3c' },
});