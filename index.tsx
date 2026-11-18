import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for Offline Support
try {
  registerSW({
    onNeedRefresh() {
      console.log('New content available.');
    },
    onOfflineReady() {
      console.log('✅ App is ready for offline use!');
    },
  });
} catch (swError) {
  console.warn('Service worker registration error:', swError);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
