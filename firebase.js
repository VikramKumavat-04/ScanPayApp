import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBduxEyIkhZvEmE0cl1alsWKFujixxGx9g",
  authDomain: "scanpayapp-5f704.firebaseapp.com",
  projectId: "scanpayapp-5f704",
  storageBucket: "scanpayapp-5f704.firebasestorage.app",
  messagingSenderId: "383166108649",
  appId: "1:383166108649:web:64fef456f22fd91290b178"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export default app;