// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const meta = import.meta as any;
const env = meta && meta.env ? meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyC_dq9Jg4Atq6j28_kdRkh_1LyAIZ3Ethg",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "lumen-academy.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "lumen-academy",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "lumen-academy.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "914900569220",
  appId: env.VITE_FIREBASE_APP_ID
};

// Use named import initializeApp
// @ts-ignore
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

// Only initialize messaging if appId is present, otherwise it throws an error
export const messaging = (app && firebaseConfig.appId) ? getMessaging(app) : null;

if (app && !firebaseConfig.appId) {
  console.warn("Firebase Messaging skipped: 'appId' is missing in configuration.");
}

export const VAPID_KEY = "BEZ7vfKZZRMgyHVygdvMmI-lIn8UwfYXLeZBAHE_J03pScjv6JMbX0GXahuJ2xFnbeCNbqFdt49eG9EoMf4AEj4";