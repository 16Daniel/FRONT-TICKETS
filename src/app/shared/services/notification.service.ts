import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  enviarNotificacion(titulo: string, mensaje: string): void {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const notificacion = new Notification(titulo, {
          body: mensaje,
          icon: 'assets/icon.png',
          silent: false
        });

        const audio = new Audio('assets/sounds/notificacion.mp3');
        audio.play()
          .then(() => console.log('Sonido reproducido correctamente'))
          .catch(err => console.error('Error al reproducir sonido:', err));

      } else if (Notification.permission === 'default' || Notification.permission === 'denied') {
        console.log('Solicitando permiso para notificaciones...');
        this.solicitarPermiso();
      } else {
        console.log('No se puede mostrar la notificación. Permiso no concedido.');
      }
    } else {
      console.warn('Las notificaciones no están soportadas en este navegador.');
    }
  }

  solicitarPermiso(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Estado del permiso de notificación:', permission);
        if (permission === 'granted') {
          console.log('¡Notificaciones habilitadas!');
        } else {
          console.log('No se permitió el permiso de notificación');
        }
      }).catch(error => {
        console.error('Error al solicitar el permiso de notificación:', error);
      });
    }
  }
}
