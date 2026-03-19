// screens/RazorpayScreen.js
import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Constants from 'expo-constants';

const RAZORPAY_KEY_ID = Constants.expoConfig?.extra?.razorpayKeyId || '';

export default function RazorpayScreen({ route, navigation }) {
  const { amount, orderId, docId, items, total } = route.params;
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const razorpayHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body style="margin:0; background:#6C63FF; display:flex; justify-content:center; align-items:center; height:100vh;">
      <script>
        var options = {
          key: '${RAZORPAY_KEY_ID}',
          amount: ${amount},
          currency: 'INR',
          name: 'ScanPay',
          description: 'Smart Cart Payment',
          order_id: '',
          prefill: {
            contact: '${user?.phoneNumber || ''}',
          },
          theme: { color: '#6C63FF' },
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SUCCESS',
              paymentId: response.razorpay_payment_id,
            }));
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'CANCELLED',
              }));
            }
          }
        };
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FAILED',
            error: response.error.description,
          }));
        });
        rzp.open();
      </script>
    </body>
    </html>
  `;

  const handleMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === 'SUCCESS') {
      // Update order with payment ID
      try {
        await updateDoc(doc(db, 'orders', docId), {
          status: 'paid',
          paymentId: data.paymentId,
        });
      } catch (e) { console.log(e); }

      navigation.replace('QRReceipt', {
        orderId,
        total,
        items,
        docId,
        paymentId: data.paymentId,
      });

    } else if (data.type === 'CANCELLED') {
      Alert.alert('Cancelled', 'Payment was cancelled.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } else if (data.type === 'FAILED') {
      Alert.alert('Failed', data.error || 'Payment failed.', [
        { text: 'Try Again', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      )}
      <WebView
        source={{ html: razorpayHTML }}
        onMessage={handleMessage}
        onLoad={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', zIndex: 10,
  },
});