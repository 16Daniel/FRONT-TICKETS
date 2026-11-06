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
