// Firebase initialization for Mariki Family Portal
// IMPORTANT: Replace the values below with your Firebase project's web config.
// Get them from: Firebase Console → Project Settings → General → Your apps → Web app
// These keys are PUBLIC (safe to commit). Security is enforced by Firestore rules.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "REPLACE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "REPLACE.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "REPLACE_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "REPLACE.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "0",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "REPLACE_APP_ID",
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("REPLACE");

let app: FirebaseApp | undefined;
if (typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export const firebaseApp = app;
export const auth = app ? getAuth(app) : (null as never);
export const db = app ? getFirestore(app) : (null as never);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== "undefined" && app) {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}
