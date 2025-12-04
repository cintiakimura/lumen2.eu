// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Cast import.meta to any to resolve TS error with env property
const env = (import.meta as any).env;

// Safely access environment variables in Vite
const apiKey = env.VITE_FIREBASE_API_KEY;
const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = env.VITE_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyC_dq9Jg4Atq6j28_kdRkh_1LyAIZ3Ethg",
  authDomain: authDomain || "lumen-academy.firebaseapp.com",
  projectId: projectId || "lumen-academy",
  storageBucket: storageBucket || "lumen-academy.firebasestorage.app",
  messagingSenderId: messagingSenderId || "914900569220",
  appId: appId
};

// Validate required fields (optional logging)
if (!firebaseConfig.apiKey) {
  console.warn("Missing Firebase API Key");
}

// Initialize Firebase
// Ensure we only initialize if we have a config, otherwise mock or null
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

// Only initialize messaging if appId is present
let messagingInstance = null;
if (app && firebaseConfig.appId) {
  try {
     messagingInstance = getMessaging(app);
  } catch (e) {
     console.warn("Firebase Messaging failed to initialize:", e);
  }
}
export const messaging = messagingInstance;

export const VAPID_KEY = "BEZ7vfKZZRMgyHVygdvMmI-lIn8UwfYXLeZBAHE_J03pScjv6JMbX0GXahuJ2xFnbeCNbqFdt49eG9EoMf4AEj4";