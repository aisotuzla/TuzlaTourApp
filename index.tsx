import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for Offline Support
registerSW({
  onNeedRefresh() {
    console.log('New content available.');
  },
  onOfflineReady() {
    console.log('✅ App is ready for offline use!');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
