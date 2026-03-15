import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';

export default function OTPScreen({ navigation, route }) {
  const { phone } = route.params;
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
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      // Firebase OTP verification will be added here
      Alert.alert('Success!', 'Phone verified successfully!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (error) {
      Alert.alert('Invalid OTP', 'Please check and try again');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={styles.appName}>ScanPay</Text>
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

        <TouchableOpacity style={styles.resend}>
          <Text style={styles.resendText}>Didn't receive OTP? </Text>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.changeNumber}>Change phone number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C63FF' },
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 22 },
  phone: { color: '#6C63FF', fontWeight: 'bold' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  otpBox: {
    width: 48, height: 56,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  otpBoxFilled: { borderColor: '#6C63FF', backgroundColor: '#f0eeff' },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resend: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  resendText: { color: '#888', fontSize: 14 },
  resendLink: { color: '#6C63FF', fontWeight: 'bold', fontSize: 14 },
  changeNumber: { color: '#888', textAlign: 'center', fontSize: 14 },
});