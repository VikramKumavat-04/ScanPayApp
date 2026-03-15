import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBduxEyIkhZvEmE0cl1alsWKFujixxGx9g",
  authDomain: "scanpayapp-5f704.firebaseapp.com",
  projectId: "scanpayapp-5f704",
  storageBucket: "scanpayapp-5f704.firebasestorage.app",
  messagingSenderId: "383166108649",
  appId: "1:383166108649:web:64fef456f22fd91290b178"
};

let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (e) {
    auth = getAuth(app);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;