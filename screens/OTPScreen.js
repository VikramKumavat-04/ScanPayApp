import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase';

export default function OTPScreen({ navigation, route }) {
  const { phone, confirmation } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
    if (!text && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
  const confirmationObj = JSON.parse(confirmation);
  const credential = PhoneAuthProvider.credential(
    confirmationObj.verificationId,
    code
  );
  await signInWithCredential(auth, credential);
} catch (error) {
  Alert.alert('Invalid OTP', 'The code you entered is wrong. Please try again.');
}
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.appName}>ScanPay</Text>
          <Text style={styles.tagline}>Scan. Pay. Verify.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to{'\n'}
            <Text style={styles.phone}>+91 {phone}</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputs.current[index] = ref}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={text => handleChange(text, index)}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resend}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.resendText}>Didn't receive OTP? </Text>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changeNumber}>Change phone number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C63FF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: { fontSize: 54, marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 14, color: '#ddd', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 28,
    lineHeight: 22,
  },
  phone: { color: '#6C63FF', fontWeight: 'bold' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#fafafa',
  },
  otpBoxFilled: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0eeff',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resendText: { color: '#888', fontSize: 14 },
  resendLink: { color: '#6C63FF', fontWeight: 'bold', fontSize: 14 },
  changeNumber: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
  },
});