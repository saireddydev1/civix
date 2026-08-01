import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
let defaultConfig: Record<string, any> = {};
try {
  const configs = (import.meta as any).glob('../firebase-applet-config.json', { eager: true });
  const localFile = configs['../firebase-applet-config.json'] as any;
  if (localFile?.default) {
    defaultConfig = localFile.default;
  }
} catch {
  // Ignored in build environment
}

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId || "",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId || ""
};

const config = firebaseConfig as typeof firebaseConfig & { firestoreDatabaseId?: string };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore DB instance
// Note: Firestore automatically handles online/offline synchronization and caching.

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
  deleteDoc,
  writeBatch
};
