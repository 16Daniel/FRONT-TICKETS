import { Injectable, inject, signal } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Usuario } from '../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../usuarios/services/users.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private messaging = inject(Messaging);
  private usersService = inject(UsersService);
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

  listenMessages(): Observable<any> {
    return new Observable((sub) => {
      onMessage(this.messaging, (payload) => {
        sub.next(payload);
      });
    });
  }
}