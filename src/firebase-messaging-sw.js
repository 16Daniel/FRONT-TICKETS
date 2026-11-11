importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const swParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: swParams.get('apiKey') || "AIzaSyCyE9Q6lYPOCKgVMAcS4E65h8QsxSihAGU",
  authDomain: swParams.get('authDomain') || "rw-rebelup.firebaseapp.com",
  projectId: swParams.get('projectId') || "rw-rebelup",
  storageBucket: swParams.get('storageBucket') || "rw-rebelup.firebasestorage.app",
  messagingSenderId: swParams.get('messagingSenderId') || "710176816572",
  appId: swParams.get('appId') || "1:710176816572:web:01b6d611c62f47ce917fb9",
  measurementId: swParams.get('measurementId') || "G-D7NZGL0TT6",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida en background: ', payload);

  // Si el payload viene como data-only (sin bloque notification), mostramos la notificación nativa manualmente
  if (!payload.notification && (payload.data?.title || payload.data?.body)) {
    const scopeUrl = self.registration && self.registration.scope ? self.registration.scope : '/';
    const iconUrl = new URL('assets/icons/icon-192x192.png', scopeUrl).toString();
    self.registration.showNotification(payload.data.title || 'Rebel Wings', {
      body: payload.data.body || '',
      icon: iconUrl,
      badge: iconUrl,
      data: payload.data,
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  if (event.notification?.data?.FCM_MSG) {
    // Dejar que el handler interno de Firebase procese las notificaciones con FCM_MSG
    return;
  }
  event.notification.close();
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const scopeUrl = self.registration && self.registration.scope ? self.registration.scope : '/';
        return self.clients.openWindow(scopeUrl);
      }
    })()
  );
});

// --- Soporte PWA (instalación nativa y detección de nueva versión desplegada) ---
let initialIndexSignature = null;

async function notifyAllClientsUpdateAvailable() {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientList) {
    client.postMessage({ type: 'SW_UPDATE_AVAILABLE' });
  }
}

async function checkServerIndexSignature() {
  try {
    const scopeUrl = self.registration && self.registration.scope ? self.registration.scope : '/';
    const indexUrl = new URL('index.html', scopeUrl).toString() + '?_sw_ts=' + Date.now();
    const response = await fetch(indexUrl, { cache: 'no-store' });
    if (!response.ok) return;

    const html = await response.text();
    const scriptMatches = html.match(/src=["'][^"']+\.js["']/gi) || [];
    const styleMatches = html.match(/href=["'][^"']+\.css["']/gi) || [];
    const signature = [...scriptMatches, ...styleMatches].join('|') || String(html.length);

    if (initialIndexSignature === null) {
      initialIndexSignature = signature;
    } else if (signature !== initialIndexSignature) {
      await notifyAllClientsUpdateAvailable();
    }
  } catch {
    // Ignorar errores de red cuando el dispositivo está offline
  }
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      await checkServerIndexSignature();
    })()
  );
});

self.addEventListener('fetch', () => {
  // Listener requerido por Chrome/Edge/Android para habilitar beforeinstallprompt
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'SW_CHECK_UPDATE') {
    event.waitUntil(checkServerIndexSignature());
  }
});
