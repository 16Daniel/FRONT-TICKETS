import { APP_VERSION } from './version';

export const environment = {
  production: false,
  version: APP_VERSION,
  whatsappApiConfig: {
    instancia: 'instance193874',
    token: 'mc4aconssqvu8m89'
  },
  firebaseConfig: {
    // apiKey: 'AIzaSyDuI2ZbIGAyUThv5p5l6aff8gcJYapyqww',
    // authDomain: 'rw-operamx-tickets.firebaseapp.com',
    // databaseURL: 'https://rw-operamx-tickets-default-rtdb.firebaseio.com',
    // projectId: 'rw-operamx-tickets',
    // storageBucket: 'rw-operamx-tickets.firebasestorage.app',
    // messagingSenderId: '650592207362',
    // appId: '1:650592207362:web:44a222eb13766364fc9d1b',
    // measurementId: 'G-ZSNCNBN2KL',
      apiKey: "AIzaSyCyE9Q6lYPOCKgVMAcS4E65h8QsxSihAGU",
      authDomain: "rw-rebelup.firebaseapp.com",
      projectId: "rw-rebelup",
      storageBucket: "rw-rebelup.firebasestorage.app",
      messagingSenderId: "710176816572",
      appId: "1:710176816572:web:01b6d611c62f47ce917fb9",
      measurementId: "G-D7NZGL0TT6"
  },
  ticketsApiConfig: {
    url: "https://localhost:7165/api/",
    apiKey: "QG15czNjcjN0QXAxazN5LXJ3LXQxY2szdHMtMjAyNkA="
  },

  planeacionApiConfig: {
    url: "https://localhost:7171/api/",
    apiKey: "QG15czNjcjN0QXAxazN5LXJ3LXAzZDFkMDUtMjAyNkA="
  },
  cuponesApiConfig: {
    url: 'https://localhost:7264',
    apiKey: 'QG15czNjcjN0QXAxazN5LXJ3LWN1cDBuMzUtMjAyNkA='
  },
  idAdministracion: "QvSLmxLZjJnaGPPsA7zi",
  idServicio: "hHqyRWm306Zmb5XADbbR",
  idDireccion: "Mcaolq7LySn81CSX4n5L",
  // vapidKey: "BG3IDd16xNfinwPfKlYWKRJSIpdql9Cjt5B5Ke-nPn4q2pC9ScQLf1BCkUGcemmHMuVOKaOVjoMAQGPHP9pmdsU",
  vapidKey: "BEBP3KmAlDVIFD8lndVQNONumIE-J3KwV08P3hnduQ46Wo7HPhKmqjgup3dMKEuX_ZVpp4j212Fzrer3bU1e_vY",
  grupoWAGerencias: "120363412785054674@g.us"
};
