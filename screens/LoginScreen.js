// // screens/LoginScreen.js
// // FIX: Removed expo-firebase-recaptcha (incompatible with Firebase v12).
// // Firebase Phone Auth on Android handles verification internally.
// // On a real device with a signed APK/AAB, SMS is sent directly.
// // For Expo Go testing, use Firebase's test phone numbers in the console.

// import { useState, useRef } from 'react';
// import {
//   View, Text, TextInput, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert,
//   KeyboardAvoidingView, Platform
// } from 'react-native';
// import { signInWithPhoneNumber } from 'firebase/auth';
// import { auth } from '../firebase';

// export default function LoginScreen({ navigation }) {
//   const [phone, setPhone] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSendOTP = async () => {
//     const trimmed = phone.trim();
//     if (trimmed.length !== 10 || !/^\d{10}$/.test(trimmed)) {
//       Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const phoneNumber = `+91${trimmed}`;

//       // NOTE: On Android physical device with a proper build, this works natively.
//       // For Expo Go testing → add test phone numbers in Firebase Console:
//       // Authentication → Sign-in method → Phone → Test phone numbers
//       const confirmation = await signInWithPhoneNumber(auth, phoneNumber);

//       Alert.alert('OTP Sent!', `A 6-digit OTP has been sent to +91${trimmed}`);
//       navigation.navigate('OTPScreen', {
//         phone: trimmed,
//         confirmation: JSON.stringify({
//           verificationId: confirmation.verificationId,
//         }),
//       });
//     } catch (error) {
//       console.error('[LoginScreen] OTP Error:', error.code, error.message);

//       // User-friendly error messages
//       let msg = error.message;
//       if (error.code === 'auth/invalid-phone-number') {
//         msg = 'The phone number format is invalid. Please enter a valid 10-digit number.';
//       } else if (error.code === 'auth/too-many-requests') {
//         msg = 'Too many attempts. Please try again later.';
//       } else if (error.code === 'auth/operation-not-allowed') {
//         msg = 'Phone sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.';
//       } else if (error.code === 'auth/argument-error') {
//         msg = 'Firebase configuration error. Make sure your .env file has valid Firebase credentials and Phone Auth is enabled in Firebase Console.';
//       } else if (error.code === 'auth/network-request-failed') {
//         msg = 'Network error. Please check your internet connection.';
//       }

//       Alert.alert('Error', msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <View style={styles.topSection}>
//         <Text style={styles.logo}>📱</Text>
//         <Text style={styles.appName}>ScanPay</Text>
//         <Text style={styles.tagline}>Scan. Pay. Verify.</Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.title}>Enter your mobile number</Text>
//         <Text style={styles.subtitle}>
//           We'll send you a 6-digit OTP to verify
//         </Text>

//         <View style={styles.inputRow}>
//           <View style={styles.countryCode}>
//             <Text style={styles.countryText}>🇮🇳 +91</Text>
//           </View>
//           <TextInput
//             style={styles.input}
//             placeholder="10-digit mobile number"
//             keyboardType="phone-pad"
//             maxLength={10}
//             value={phone}
//             onChangeText={setPhone}
//             placeholderTextColor="#aaa"
//           />
//         </View>

//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleSendOTP}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Send OTP →</Text>
//           )}
//         </TouchableOpacity>

//         <Text style={styles.terms}>
//           By continuing, you agree to our Terms & Privacy Policy
//         </Text>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#6C63FF' },
//   topSection: {
//     flex: 1, justifyContent: 'center', alignItems: 'center',
//   },
//   logo: { fontSize: 64, marginBottom: 12 },
//   appName: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
//   tagline: { fontSize: 16, color: '#ddd', marginTop: 4 },
//   card: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     padding: 32,
//     paddingBottom: 48,
//   },
//   title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
//   subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
//   inputRow: { flexDirection: 'row', marginBottom: 20 },
//   countryCode: {
//     backgroundColor: '#f0f0f0', borderRadius: 12,
//     paddingHorizontal: 14, justifyContent: 'center', marginRight: 10,
//   },
//   countryText: { fontSize: 15, color: '#333', fontWeight: '600' },
//   input: {
//     flex: 1, backgroundColor: '#f0f0f0',
//     borderRadius: 12, paddingHorizontal: 16,
//     paddingVertical: 14, fontSize: 16, color: '#333',
//   },
//   button: {
//     backgroundColor: '#6C63FF', borderRadius: 12,
//     paddingVertical: 16, alignItems: 'center', marginBottom: 16,
//   },
//   buttonDisabled: { opacity: 0.7 },
//   buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
//   terms: { fontSize: 12, color: '#aaa', textAlign: 'center' },
// }); 
// screens/LoginScreen.js
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithPhoneNumber } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '../firebase';
import app from '../firebase';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaVerifier = useRef(null);

  const handleSendOTP = async () => {
    const trimmed = phone.trim();
    if (trimmed.length !== 10 || !/^\d{10}$/.test(trimmed)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!recaptchaVerifier.current) {
      Alert.alert('Error', 'reCAPTCHA not ready. Please wait and try again.');
      return;
    }
    setLoading(true);
    try {
      const phoneNumber = `+91${trimmed}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier.current
      );
      Alert.alert('OTP Sent!', `A 6-digit OTP has been sent to +91${trimmed}`);
      navigation.navigate('OTPScreen', {
        phone: trimmed,
        confirmation: JSON.stringify({
          verificationId: confirmation.verificationId,
        }),
      });
    } catch (error) {
      console.error('[LoginScreen] OTP Error:', error.code, error.message);
      let msg = error.message;
      if (error.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Try again later.';
      } else if (error.code === 'auth/operation-not-allowed') {
        msg = 'Phone sign-in not enabled. Enable it in Firebase Console → Authentication → Sign-in method.';
      } else if (error.code === 'auth/argument-error') {
        msg = 'Configuration error. Make sure Phone Auth is enabled in Firebase Console and your app domain is in Authorized Domains.';
      } else if (error.code === 'auth/network-request-failed') {
        msg = 'Network error. Check your internet connection.';
      }
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* reCAPTCHA verifier — required for Expo Go + Firebase v9+ */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
        androidHardwareAccelerationDisabled={true}
      />

      <View style={styles.topSection}>
        <Text style={styles.logo}>📱</Text>
        <Text style={styles.appName}>ScanPay</Text>
        <Text style={styles.tagline}>Scan. Pay. Verify.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Enter your mobile number</Text>
        <Text style={styles.subtitle}>We'll send you a 6-digit OTP to verify</Text>

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
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Send OTP →</Text>
          }
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
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 16, color: '#ddd', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
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