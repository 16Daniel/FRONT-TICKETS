import { Injectable, inject, signal } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private messaging = inject(Messaging);
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

  private async getFcmToken(): Promise<string | null> {
    try {
      let registration: ServiceWorkerRegistration | undefined;
      if (environment.production) {
        registration = await navigator.serviceWorker.register('/front/ticketstest/firebase-messaging-sw.js');
      } else {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      await navigator.serviceWorker.ready;

      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('FCM Token obtenido con éxito:', token);
        this.fcmToken.set(token); // Actualizamos la signal
        return token;
      }
      return null;
    } catch (error: any) {
      if (error?.message?.includes('push service error')) {
        console.error('Error de Push Service: Revisa la VAPID Key, VPNs/Adblockers o permisos del SO.');
      } else {
        console.error('Error al obtener el token:', error);
      }
      return null;
    }
  }

  listenMessages(): Observable<any> {
    return new Observable((sub) => {
      onMessage(this.messaging, (payload) => {
        sub.next(payload);
      });
    });
  }
}