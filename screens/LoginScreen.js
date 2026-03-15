import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useRef } from 'react';
import { auth } from '../firebase';
import app from '../firebase';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaVerifier = useRef(null);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const phoneNumber = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier.current
      );
      Alert.alert('OTP Sent!', `OTP sent to +91${phone}`);
      navigation.navigate('OTPScreen', {
        phone,
        confirmation: JSON.stringify({
          verificationId: confirmation.verificationId
        })
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

      <View style={styles.topSection}>
        <Text style={styles.logo}>📱</Text>
        <Text style={styles.appName}>ScanPay</Text>
        <Text style={styles.tagline}>Scan. Pay. Verify.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Enter your mobile number</Text>
        <Text style={styles.subtitle}>
          We'll send you a 6-digit OTP to verify
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C63FF' },
  topSection: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 16, color: '#ddd', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32, paddingBottom: 48,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  countryCode: {
    backgroundColor: '#f0f0f0', borderRadius: 12,
    paddingHorizontal: 14, justifyContent: 'center', marginRight: 10,
  },
  countryText: { fontSize: 15, color: '#333', fontWeight: '600' },
  input: {
    flex: 1, backgroundColor: '#f0f0f0',
    borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 16, color: '#333',
  },
  button: {
    backgroundColor: '#6C63FF', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  terms: { fontSize: 12, color: '#aaa', textAlign: 'center' },
});