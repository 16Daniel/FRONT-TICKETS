importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    // apiKey: 'AIzaSyCavGJWR7uF85WbuaeA4iOB_Ecb0zL45P4',
    //     authDomain: 'tickets-23dc4.firebaseapp.com',
    //     projectId: 'tickets-23dc4',
    //     storageBucket: 'tickets-23dc4.firebasestorage.app',
    //     messagingSenderId: '40556074271',
    //     appId: '1:40556074271:web:6974d3841f643262fa4c2a',
    //     measurementId: 'G-5VSPY22GN7',
     apiKey: 'AIzaSyDuI2ZbIGAyUThv5p5l6aff8gcJYapyqww',
    authDomain: 'rw-operamx-tickets.firebaseapp.com',
    databaseURL: 'https://rw-operamx-tickets-default-rtdb.firebaseio.com',
    projectId: 'rw-operamx-tickets',
    storageBucket: 'rw-operamx-tickets.firebasestorage.app',
    messagingSenderId: '650592207362',
    appId: '1:650592207362:web:44a222eb13766364fc9d1b',
    measurementId: 'G-ZSNCNBN2KL',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida en background: ', payload);
  
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/front/tickets/assets/img/RW_LogoWEB.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
});