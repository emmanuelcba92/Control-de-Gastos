import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'

// Register Service Worker for Firebase Messaging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'firebase-messaging-sw.js';
    navigator.serviceWorker.register(swPath)
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
