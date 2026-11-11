# Firebase push notifications

The app supports browser/PWA push and native Android push. Android uses
Capacitor's Push Notifications plugin; browser push uses Firebase Messaging and
the `public/firebase-messaging-sw.js` service worker.

## Firebase Console setup

1. Open the Firebase project configured by the app (`tuzlatourguide`).
2. Add an Android app with package name `com.tuzlatourguide`.
3. Download its `google-services.json` and place it at
   `android/app/google-services.json`.
4. For Web/PWA push, open **Project settings → Cloud Messaging → Web Push
   certificates** and copy the public VAPID key. Set it in the web build
   environment as `VITE_FIREBASE_VAPID_KEY`.

The web app's Firebase configuration is read from the `VITE_FIREBASE_*`
environment variables in `utils/firebase.ts`. The current project configuration
has fallbacks for these values; the VAPID key should be set from Firebase
Console for the target Firebase project.

## Build and test

After adding `google-services.json`, sync and build Android:

```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

Install the debug APK on an Android device with Google Play services and allow
notifications when prompted. The FCM registration token is saved in the app's
local storage under `tuzla_fcm_token`. Use Firebase Console's test-message
workflow to send a message to that token. Foreground Android messages are
displayed as local notifications; tapping a message with a `route` or `url`
data value beginning with `/` navigates to that in-app path.

For Web/PWA, serve the app over HTTPS, configure the VAPID key, allow browser
notifications, and test with the browser's FCM registration token from the same
local-storage key.

The app currently keeps registration tokens on-device for testing; it does not
upload them to a server. For automatic or user-targeted campaigns, add an
authenticated token-registration endpoint and send messages from a trusted
server using Firebase Admin SDK or FCM HTTP v1. Never put service-account
credentials in the client app.
