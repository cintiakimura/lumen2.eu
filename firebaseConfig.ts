
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const getEnv = () => {
  try {
    return (import.meta as any).env || {};
  } catch (e) {
    return {};
  }
};

const env = getEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AlzaSyC_dq9Jg4Atq6j28_kdRkh_1LyAlZ3Ethg",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "lumenacademy-ec5a1.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "lumenacademy-ec5a1",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "lumenacademy-ec5a1.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "914900569220",
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
        
        if (firebaseConfig.appId) {
            try {
                messagingInstance = getMessaging(app);
            } catch (e) {
                console.warn("Messaging failed to init:", e);
            }
        }
    } else {
        console.warn("Firebase Config missing API Key. App will run in Offline Mode.");
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;
export const messaging = messagingInstance;
export const VAPID_KEY = "BEZ7vfKZZRMgyHVygdvMmI-lIn8UwfYXLeZBAHE_J03pScjv6JMbX0GXahuJ2xFnbeCNbqFdt49eG9EoMf4AEj4";
