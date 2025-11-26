import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyANC9IEGhH8_GPjDT5xxjHpY0QK02J3luQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "awp-job.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "awp-job",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "awp-job.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "502883934375",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:502883934375:web:6f6ea7bc63f2ea8118fb82"
};

// Debug log for environment variables (remove in production)
console.log('Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✅ API Key loaded' : '❌ API Key missing',
  authDomain: firebaseConfig.authDomain ? '✅ Auth Domain loaded' : '❌ Auth Domain missing',
  projectId: firebaseConfig.projectId ? '✅ Project ID loaded' : '❌ Project ID missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;