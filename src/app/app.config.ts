import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDA1lbEvt7w2-PKk2NCreHrgc2JqJl53LQ",
  authDomain: "control-pagos-9baed.firebaseapp.com",
  projectId: "control-pagos-9baed",
  storageBucket: "control-pagos-9baed.firebasestorage.app",
  messagingSenderId: "193774158414",
  appId: "1:193774158414:web:125a920f765cdb9c59791f",
  measurementId: "G-0TDZ7XPJEQ"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};