import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'tickets-23dc4',
        appId: '1:40556074271:web:6974d3841f643262fa4c2a',
        storageBucket: 'tickets-23dc4.firebasestorage.app',
        apiKey: 'AIzaSyCavGJWR7uF85WbuaeA4iOB_Ecb0zL45P4',
        authDomain: 'tickets-23dc4.firebaseapp.com',
        messagingSenderId: '40556074271',
        measurementId: 'G-5VSPY22GN7',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'tickets-23dc4',
        appId: '1:40556074271:web:6974d3841f643262fa4c2a',
        storageBucket: 'tickets-23dc4.firebasestorage.app',
        apiKey: 'AIzaSyCavGJWR7uF85WbuaeA4iOB_Ecb0zL45P4',
        authDomain: 'tickets-23dc4.firebaseapp.com',
        messagingSenderId: '40556074271',
        measurementId: 'G-5VSPY22GN7',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
