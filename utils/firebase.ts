import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from 'firebase/messaging';

const requiredFirebaseEnv = (name: keyof ImportMetaEnv): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing Firebase configuration: ${name}. Set it in .env.local or your deployment environment.`);
  }
  return value;
};

export const firebaseConfig = {
  apiKey: requiredFirebaseEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requiredFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredFirebaseEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requiredFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredFirebaseEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredFirebaseEnv('VITE_FIREBASE_APP_ID'),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  import.meta.env.VITE_VAPID_KEY;

// Singleton Firebase App instance
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let messagingInstance: Messaging | null = null;

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
};

/**
 * Request notification permission and retrieve the FCM device token
 */
export const requestPushToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this environment');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission denied by user');
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('Firebase Messaging not supported on this browser');
      return null;
    }
    if (!VAPID_KEY) {
      throw new Error('Missing Firebase Messaging VAPID key. Set VITE_FIREBASE_VAPID_KEY in .env.local or your deployment environment.');
    }

    // Register service worker if not already registered
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
    }

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });

    if (currentToken) {
      try {
        localStorage.setItem('tuzla_fcm_token', currentToken);
      } catch (error) {
        console.warn('Unable to store the web FCM registration token locally:', error);
      }
      return currentToken;
    } else {
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
};

/**
 * Listen for messages while app is in foreground
 */
export const onForegroundMessage = async (callback: (payload: MessagePayload) => void) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('Foreground push notification received:', payload);
    callback(payload);
  });
};
