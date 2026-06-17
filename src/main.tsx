import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite WebSocket and HMR connection errors in the preview environment
if (typeof window !== "undefined") {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason && reason.message) || (typeof reason === 'string' ? reason : '');
    if (msg && (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('vite') || msg.includes('WS'))) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('vite') || msg.includes('WS')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
