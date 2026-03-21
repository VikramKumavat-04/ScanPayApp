

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey:            extra.firebaseApiKey,
  authDomain:        extra.firebaseAuthDomain,
  projectId:         extra.firebaseProjectId,
  storageBucket:     extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId:             extra.firebaseAppId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;