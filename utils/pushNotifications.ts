import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { onForegroundMessage, requestPushToken } from './firebase';

const TOKEN_STORAGE_KEY = 'tuzla_fcm_token';
const DEFAULT_NOTIFICATION_TITLE = 'Tuzla Tour Guide';

export interface PushNotificationHandlers {
  onToken: (token: string) => void;
  onMessage: (title: string, body: string) => void;
  onAction: (data: Record<string, unknown>) => void;
}

const asDataRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const storeToken = (token: string, handlers: PushNotificationHandlers) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.warn('Unable to store the FCM registration token locally:', error);
  }
  handlers.onToken(token);
};

const registerNativePushNotifications = async (
  handlers: PushNotificationHandlers
): Promise<() => void> => {
  const listenerHandles: PluginListenerHandle[] = [];
  const removeListeners = async () => {
    await Promise.all(listenerHandles.map((handle) => handle.remove()));
  };

  try {
    listenerHandles.push(await PushNotifications.addListener('registration', ({ value }) => {
      storeToken(value, handlers);
    }));
    listenerHandles.push(await PushNotifications.addListener('registrationError', (error) => {
      console.error('FCM registration failed:', error);
    }));
    listenerHandles.push(await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      const data = asDataRecord(notification.data);
      const title =
        notification.title ??
        (typeof data.title === 'string' ? data.title : DEFAULT_NOTIFICATION_TITLE);
      const body = notification.body ?? (typeof data.body === 'string' ? data.body : '');

      handlers.onMessage(title, body);
      void LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 2_147_483_647),
            title,
            body,
            schedule: { at: new Date(Date.now() + 250) },
            extra: data
          }
        ]
      }).catch((error: unknown) => {
        console.error('Unable to display the foreground push notification:', error);
      });
    }));
    listenerHandles.push(
      await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
        handlers.onAction(asDataRecord(notification.data));
      })
    );
    listenerHandles.push(
      await LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
        handlers.onAction(asDataRecord(notification.extra));
      })
    );

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== 'granted') {
      console.warn('Push notification permission was not granted.');
      await removeListeners();
      return () => {};
    }

    await PushNotifications.register();
    return () => {
      void removeListeners().catch((error: unknown) => {
        console.error('Unable to remove push notification listeners:', error);
      });
    };
  } catch (error) {
    await removeListeners();
    throw error;
  }
};

export const initializePushNotifications = async (
  handlers: PushNotificationHandlers
): Promise<() => void> => {
  if (Capacitor.isNativePlatform()) {
    return registerNativePushNotifications(handlers);
  }

  if (Capacitor.getPlatform() !== 'web') {
    return () => {};
  }

  const unsubscribe = await onForegroundMessage((payload) => {
    const data = asDataRecord(payload.data);
    const title =
      payload.notification?.title ??
      (typeof data.title === 'string' ? data.title : DEFAULT_NOTIFICATION_TITLE);
    const body = payload.notification?.body ?? (typeof data.body === 'string' ? data.body : '');

    handlers.onMessage(title, body);

    if (Notification.permission === 'granted') {
      void navigator.serviceWorker.getRegistration('/').then((registration) => {
        if (registration) {
          return registration.showNotification(title, {
            body,
            icon: '/resources/TuzlaTourAppLogo192x192.png',
            data
          });
        }
      }).catch((error: unknown) => {
        console.error('Unable to display the foreground web push notification:', error);
      });
    }
  });

  void requestPushToken()
    .then((token) => {
      if (token) handlers.onToken(token);
    })
    .catch((error: unknown) => {
      console.error('Unable to register for web push notifications:', error);
    });

  return unsubscribe;
};
