import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() =>

      initializeApp({
        apiKey: 'AIzaSyDuI2ZbIGAyUThv5p5l6aff8gcJYapyqww',
        authDomain: 'rw-operamx-tickets.firebaseapp.com',
        databaseURL: 'https://rw-operamx-tickets-default-rtdb.firebaseio.com',
        projectId: 'rw-operamx-tickets',
        storageBucket: 'rw-operamx-tickets.firebasestorage.app',
        messagingSenderId: '650592207362',
        appId: '1:650592207362:web:44a222eb13766364fc9d1b',
        measurementId: 'G-ZSNCNBN2KL',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    
    // provideFirebaseApp(() =>
    //   initializeApp({
    //     projectId: 'tickets-23dc4',
    //     appId: '1:40556074271:web:6974d3841f643262fa4c2a',
    //     storageBucket: 'tickets-23dc4.firebasestorage.app',
    //     apiKey: 'AIzaSyCavGJWR7uF85WbuaeA4iOB_Ecb0zL45P4',
    //     authDomain: 'tickets-23dc4.firebaseapp.com',
    //     messagingSenderId: '40556074271',
    //     measurementId: 'G-5VSPY22GN7',
    //   })
    // ),
    // provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()),
  ],
};
