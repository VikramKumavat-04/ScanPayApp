import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import app from '../firebase';

const auth = getAuth(app);

export default function ProfileScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>V</Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>Vikram Kumavat</Text>
      <Text style={[styles.phone, { color: colors.subtext }]}>
        {user?.phoneNumber || '+91 XXXXXXXXXX'}
      </Text>

      <View style={styles.menu}>

        <View style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.menuText, { color: colors.text }]}>
            {mode === 'dark' ? '🌙  Dark Mode' : '☀️  Light Mode'}
          </Text>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.menuText, { color: colors.text }]}>📋  My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.menuText, { color: colors.text }]}>🔔  Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.menuText, { color: colors.text }]}>⚙️  Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logout, { borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold' },
  phone: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  menu: { width: '90%' },
  menuItem: {
    padding: 16, borderRadius: 12,
    marginBottom: 10, elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  menuText: { fontSize: 15 },
  logout: { backgroundColor: '#fff3f3' },
  logoutText: { fontSize: 15, color: '#e74c3c' },
});