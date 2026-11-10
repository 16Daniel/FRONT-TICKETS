// Service Worker principal para PWA (instalación nativa, detección de nuevas versiones y Firebase Messaging)
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

self.addEventListener('install', (event) => {
  if (!self.registration || !self.registration.active) {
    // Primera instalación: tomar control de inmediato para habilitar beforeinstallprompt
    self.skipWaiting();
  } else {
    // Actualización del Service Worker detectada: avisar a la aplicación
    event.waitUntil(notifyAllClientsUpdateAvailable());
  }
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
  // Listener fetch requerido por Chrome/Edge/Android para instalación nativa PWA
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'SW_CHECK_UPDATE') {
    event.waitUntil(checkServerIndexSignature());
  }
});

try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyCyE9Q6lYPOCKgVMAcS4E65h8QsxSihAGU",
    authDomain: "rw-rebelup.firebaseapp.com",
    projectId: "rw-rebelup",
    storageBucket: "rw-rebelup.firebasestorage.app",
    messagingSenderId: "710176816572",
    appId: "1:710176816572:web:01b6d611c62f47ce917fb9",
    measurementId: "G-D7NZGL0TT6"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notificación recibida en background: ', payload);
  });
} catch (error) {
  console.warn('[firebase-messaging-sw.js] No se pudo inicializar Firebase Messaging en SW:', error);
}
