import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { db, auth } from '../firebase';

export default function EditProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setName(data.name || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setCity(data.city || '');
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name!');
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        updatedAt: new Date().toISOString(),
      });
      Alert.alert(
        'Saved! ✅',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save profile.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scroll}>
        <View style={[styles.avatarSection, { backgroundColor: colors.primary }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name[0].toUpperCase() : user?.phoneNumber?.slice(-2) || 'U'}
            </Text>
          </View>
          <Text style={styles.avatarPhone}>
            {user?.phoneNumber}
          </Text>
          <Text style={styles.avatarNote}>
            Phone number cannot be changed
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
            PERSONAL INFO
          </Text>

          <View style={[styles.inputGroup, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.subtext}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={[styles.inputGroup, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>
              Email Address
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={[styles.sectionTitle, {
            color: colors.subtext, marginTop: 16
          }]}>
            ADDRESS
          </Text>

          <View style={[styles.inputGroup, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>
              Address
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your address"
              placeholderTextColor={colors.subtext}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={[styles.inputGroup, {
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>
              City
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your city"
              placeholderTextColor={colors.subtext}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelBtnText, { color: colors.subtext }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  avatarSection: { padding: 32, alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  avatarPhone: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  avatarNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  form: { padding: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600',
    marginBottom: 10, marginLeft: 4, letterSpacing: 1,
  },
  inputGroup: {
    borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 0.5,
  },
  inputLabel: { fontSize: 12, marginBottom: 6 },
  input: { fontSize: 15, padding: 0 },
  saveBtn: {
    borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: {
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1,
  },
  cancelBtnText: { fontSize: 15 },
});