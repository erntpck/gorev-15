import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDfsrAsTllMRuU4o7COb5e8mgPZtekk040',
  authDomain: 'fir-9ee2d.firebaseapp.com',
  projectId: 'fir-9ee2d',
  storageBucket: 'fir-9ee2d.firebasestorage.app',
  messagingSenderId: '214463296909',
  appId: '1:214463296909:web:1805bd396701c10b79f9c4',
  measurementId: 'G-K4DYJ92T1X',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
