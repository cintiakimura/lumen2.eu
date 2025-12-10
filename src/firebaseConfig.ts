
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const getEnv = () => {
  try {
    // Check import.meta.env for Vite
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env;
    }
    // Fallback to process.env if available
    if (typeof process !== 'undefined' && process.env) {
      return process.env;
    }
  } catch (e) {
    // Ignore error
  }
  return {};
};

const env = getEnv();

// Updated Config for Project: lumen20-88e2c
const firebaseConfig = {
  // IMPORTANT: The API Key must be provided via the VITE_FIREBASE_API_KEY environment variable.
  // The previous hardcoded key was invalid for this project.
  apiKey: env.VITE_FIREBASE_API_KEY, 
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "lumen20-88e2c.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "lumen20-88e2c",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "lumen20-88e2c.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1009890099306",
  appId: env.VITE_FIREBASE_APP_ID
};

let app = null;
let dbInstance = null;
let authInstance = null;
let storageInstance = null;
let messagingInstance = null;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
        app = initializeApp(firebaseConfig);
        dbInstance = getFirestore(app);
        authInstance = getAuth(app);
        storageInstance = getStorage(app);
        
        if (firebaseConfig.appId || firebaseConfig.messagingSenderId) {
            try {
                messagingInstance = getMessaging(app);
            } catch (e) {
                console.warn("Messaging failed to init:", e);
            }
        }
    } else {
        console.warn("Firebase Config missing API Key. App will run in Offline Mode (Demo).");
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;
export const messaging = messagingInstance;
export const VAPID_KEY = "BEZ7vfKZZRMgyHVygdvMmI-lIn8UwfYXLeZBAHE_J03pScjv6JMbX0GXahuJ2xFnbeCNbqFdt49eG9EoMf4AEj4";
