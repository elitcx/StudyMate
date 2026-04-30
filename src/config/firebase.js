import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_lGNYoK3pNaaNciQETfMg9gLLUWD51c0",
  authDomain: "studymate-24f7f.firebaseapp.com",
  projectId: "studymate-24f7f",
  storageBucket: "studymate-24f7f.firebasestorage.app",
  messagingSenderId: "60135279308",
  appId: "1:60135279308:web:ac37329049083a3eba1069",
  measurementId: "G-SGWZWVF7R7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);