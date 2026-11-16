importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = __FIREBASE_CONFIG__;

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Tuzla Tour Guide';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/resources/TuzlaTourAppLogo192x192.png',
    badge: '/resources/TuzlaTourAppLogo192x192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url || '/', self.location.origin);
  const urlToOpen =
    requestedUrl.origin === self.location.origin
      ? requestedUrl
      : new URL('/', self.location.origin);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin === urlToOpen.origin && 'focus' in client) {
          return client.navigate(urlToOpen.href).then(() => client.focus());
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen.href);
      }
    })
  );
});
