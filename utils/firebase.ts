import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from 'firebase/remote-config';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCJ5LGNfZRB0yDT8Fh4tQu1czDNQrL99rk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tuzlatourguide.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tuzlatourguide",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tuzlatourguide.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "243343684809",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:243343684809:web:8835b25710cc8988bb4918",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FHZ2NMYPG3"
};

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  import.meta.env.VITE_VAPID_KEY ||
  "BM4mZvcTrzTA2VuoeVW1EjYVXRZzjHMuKAZZUxgThQza6Ri1oOoRqY6ZJmgAuwgxjBzWLJQme-oC8HqRIgYdP48";

// Singleton Firebase App instance
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let messagingInstance: Messaging | null = null;
let remoteConfigInstance: RemoteConfig | null = null;

/**
 * Initialize and get Remote Config instance with in-app defaults
 */
export const getFirebaseRemoteConfig = async (): Promise<RemoteConfig | null> => {
  if (typeof window === 'undefined') return null;
  try {
    if (!remoteConfigInstance) {
      remoteConfigInstance = getRemoteConfig(app);
      remoteConfigInstance.settings = {
        minimumFetchIntervalMillis: 3600000, // 1 hour caching
        fetchTimeoutMillis: 60000,
      };
      // In-app default parameters
      remoteConfigInstance.defaultConfig = {
        welcome_banner_enabled: true,
        welcome_message: "Dobrodošli u Tuzlu!",
        ar_guide_enabled: true,
        max_horizon_meters: 40,
        enable_push_campaigns: true
      };
      await fetchAndActivate(remoteConfigInstance);
    }
    return remoteConfigInstance;
  } catch (err) {
    console.warn('Firebase Remote Config init notice:', err);
    return null;
  }
};

/**
 * Get a specific Remote Config value
 */
export const getRemoteConfigValue = async (key: string): Promise<string | null> => {
  const rc = await getFirebaseRemoteConfig();
  if (!rc) return null;
  return getValue(rc, key).asString();
};

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

    // Register service worker if not already registered
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      await navigator.serviceWorker.ready;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });

    if (currentToken) {
      console.log('✅ FCM Push Token obtained:', currentToken);
      try {
        localStorage.setItem('tuzla_fcm_token', currentToken);
      } catch (_) {}
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
 * Listen for messages while app is in foreground and show native / browser notification
 */
export const onForegroundMessage = async (callback?: (payload: any) => void) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('Foreground push notification received:', payload);
    if (callback) callback(payload);

    // Trigger visual notification toast or browser Notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const title = payload.notification?.title || payload.data?.title || 'Tuzla Tour Guide';
      const body = payload.notification?.body || payload.data?.body || '';
      try {
        new Notification(title, {
          body,
          icon: '/favicon.png',
          badge: '/favicon.png',
        });
      } catch (e) {
        console.warn('Could not display foreground notification banner:', e);
      }
    }
  });
};

