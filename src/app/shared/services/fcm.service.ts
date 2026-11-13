import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Usuario } from '../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../usuarios/services/users.service';

const DEFAULT_FIREBASE_VAPID_KEY =
  'BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4';

export function buildFirebaseSwUrl(): string {
  const basePath =
    typeof window !== 'undefined' && window.location.pathname.includes('/front/ticketstest/')
      ? '/front/ticketstest/firebase-messaging-sw.js'
      : typeof window !== 'undefined' && window.location.pathname.includes('/front/tickets/')
        ? '/front/tickets/firebase-messaging-sw.js'
        : '/firebase-messaging-sw.js';

  const cfg = environment.firebaseConfig;
  const params = new URLSearchParams({
    apiKey: cfg.apiKey || '',
    authDomain: cfg.authDomain || '',
    projectId: cfg.projectId || '',
    storageBucket: cfg.storageBucket || '',
    messagingSenderId: cfg.messagingSenderId || '',
    appId: cfg.appId || '',
    measurementId: cfg.measurementId || '',
  });

  return `${basePath}?${params.toString()}`;
}

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private messaging = inject(Messaging);
  private usersService = inject(UsersService);
  private ngZone = inject(NgZone);
  fcmToken = signal<string | null>(null);

  async requestPermission(): Promise<string | null> {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await this.getFcmToken();
    } else {
      console.warn('Permiso de notificaciones denegado');
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private hasVapidKeyMismatch(existingSub: PushSubscription, expectedVapidKey: string): boolean {
    try {
      const subKeyBuffer = existingSub.options?.applicationServerKey;
      if (!subKeyBuffer) return false;
      const actualBytes = new Uint8Array(subKeyBuffer);
      const expectedBytes = this.urlBase64ToUint8Array(expectedVapidKey);
      if (actualBytes.length !== expectedBytes.length) return true;
      for (let i = 0; i < actualBytes.length; i++) {
        if (actualBytes[i] !== expectedBytes[i]) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private clearIndexedDbStore(dbName: string, storeName: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(dbName);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolve();
            return;
          }
          try {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).clear();
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => {
              db.close();
              resolve();
            };
          } catch {
            db.close();
            resolve();
          }
        };
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async ensureMatchingPushSubscription(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      const allRegs = await navigator.serviceWorker.getRegistrations();
      for (const reg of allRegs) {
        if (reg.scope.includes('firebase-cloud-messaging-push-scope')) {
          await reg.unregister();
        }
      }
    } catch {}

    try {
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub && this.hasVapidKeyMismatch(existingSub, environment.vapidKey)) {
        // console.log('[FCM] Suscripción previa con otra VAPID Key detectada. Renovando suscripción para el certificado actual...');
        await existingSub.unsubscribe();
        await this.clearIndexedDbStore('firebase-messaging-database', 'firebase-messaging-store');
      }
    } catch {}
  }

  private async resetCorruptedFcmState(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }
    } catch {}

    await Promise.all([
      this.clearIndexedDbStore('firebase-messaging-database', 'firebase-messaging-store'),
      this.clearIndexedDbStore('firebase-installations-database', 'firebase-installations-store'),
    ]);
  }

  private async obtainTokenWithFallback(registration: ServiceWorkerRegistration): Promise<string | null> {
    await this.ensureMatchingPushSubscription(registration);

    // 1. Intento normal con la vapidKey del environment
    try {
      return await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration,
      });
    } catch (firstError: any) {
      console.warn('[FCM] Primer intento de getToken falló, limpiando estado cacheado de IndexedDB/PushManager...', firstError?.code || firstError);
    }

    // 2. Limpiar estado corrupto en IndexedDB (messaging + installations) y PushSubscription y reintentar
    await this.resetCorruptedFcmState(registration);
    try {
      return await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration,
      });
    } catch (secondError: any) {
      console.warn('[FCM] Segundo intento con vapidKey personalizada falló, probando con certificado Web Push por defecto de Firebase...', secondError?.code || secondError);
    }

    // 3. Respaldo con certificado por defecto de Firebase
    await this.resetCorruptedFcmState(registration);
    return await getToken(this.messaging, {
      vapidKey: DEFAULT_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  }

  private async getFcmToken(): Promise<string | null> {
    try {
      const swUrl = buildFirebaseSwUrl();
      const registration = await navigator.serviceWorker.register(swUrl);

      await navigator.serviceWorker.ready;

      const token = await this.obtainTokenWithFallback(registration);

      if (token) {
        // console.log('FCM Token obtenido con éxito:', token);
        this.fcmToken.set(token);
        try {
          await this.saveTokenForCurrentUser(token);
        } catch (error) {
          console.error('Error al guardar el token FCM del usuario:', error);
        }
        return token;
      }
      return null;
    } catch (error: any) {
      if (error?.message?.includes('push service error')) {
        console.error('Error de Push Service: Revisa la VAPID Key, VPNs/Adblockers o permisos del SO.');
      } else if (error?.code === 'messaging/token-subscribe-failed' || error?.message?.includes('missing required authentication credential')) {
        console.error(
          'Error 401 en FCM Registration API para el proyecto "' +
            environment.firebaseConfig.projectId +
            '". Verifica en Google Cloud Console -> APIs & Services -> Credentials que la API Key (' +
            environment.firebaseConfig.apiKey +
            ') tenga permitido "FCM Registration API" (fcmregistrations.googleapis.com) y "Firebase Installations API", o que la VAPID Key corresponda al proyecto.',
          error
        );
      } else {
        console.error('Error al obtener el token:', error);
      }
      return null;
    }
  }

  private async saveTokenForCurrentUser(token: string): Promise<void> {
    const storedUser = localStorage.getItem('rwuserdatatk');
    if (!storedUser) return;

    const user = JSON.parse(storedUser) as Usuario;
    if (typeof user.id !== 'string' || !user.id) {
      console.error('No se puede guardar el token FCM: el usuario de la sesión no tiene un id válido.');
      return;
    }

    const tokens = Array.isArray(user.fcmToken)
      ? [...new Set(user.fcmToken.filter((storedToken) => typeof storedToken === 'string'))]
      : [];

    if (tokens.includes(token)) return;
    if (tokens.length >= 3) tokens.splice(0, tokens.length - 2);
    tokens.push(token);

    await this.usersService.updateUserFcmTokens(user.id, tokens);
    user.fcmToken = tokens;
    localStorage.setItem('rwuserdatatk', JSON.stringify(user));
  }

  async showNativeNotification(payload: any): Promise<void> {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const title = payload?.notification?.title || payload?.data?.title || 'Notificación';
    const body = payload?.notification?.body || payload?.data?.body || '';
    const iconUrl =
      payload?.notification?.icon ||
      new URL('assets/icons/icon-192x192.png', document.baseURI).toString();
    const image = payload?.notification?.image;

    const options: NotificationOptions & { image?: string } = {
      body,
      icon: iconUrl,
      badge: iconUrl,
      data: payload?.data || payload,
    };
    if (image) {
      options.image = image;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
        return;
      }
    } catch {}

    try {
      new Notification(title, options);
    } catch {}
  }

  listenMessages(): Observable<any> {
    return new Observable((sub) => {
      onMessage(this.messaging, (payload) => {
        // console.log('[FCM Foreground] Notificación recibida:', payload);
        this.showNativeNotification(payload);
        this.ngZone.run(() => sub.next(payload));
      });
    });
  }
}
