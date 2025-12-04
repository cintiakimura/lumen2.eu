
import { getToken, onMessage } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../firebaseConfig";

export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn("Messaging not initialized. Check firebaseConfig.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
      }
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token.', error);
  }
  return null;
};

// Refactored to use callback pattern to prevent "Async response channel closed" errors
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;
  try {
      return onMessage(messaging, (payload) => {
          callback(payload);
      });
  } catch (e) {
      console.warn("Messaging listener setup failed:", e);
  }
};
