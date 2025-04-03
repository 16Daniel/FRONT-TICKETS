import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  constructor() { }

  // Enviar notificación si el permiso está concedido
  enviarNotificacion(titulo: string, mensaje: string): void {
    if ('Notification' in window) {
      // Si el permiso es 'granted', mostramos la notificación
      if (Notification.permission === 'granted') {
        const notificacion = new Notification(titulo, {
          body: mensaje,
          icon: 'assets/icon.png',
          silent: false // 🔊 Asegura que tenga sonido
        });

        // Reproducir sonido manualmente
        const audio = new Audio('assets/sounds/notificacion.mp3');
        audio.play()
          .then(() => console.log('Sonido reproducido correctamente'))
          .catch(err => console.error('Error al reproducir sonido:', err));

      } else if (Notification.permission === 'default' || Notification.permission === 'denied') {
        // Si el permiso es 'default' o 'denied', lo solicitamos nuevamente
        console.log('Solicitando permiso para notificaciones...');
        this.solicitarPermiso();
      } else {
        console.log('No se puede mostrar la notificación. Permiso no concedido.');
      }
    } else {
      console.warn('Las notificaciones no están soportadas en este navegador.');
    }
  }

  // Solicitar permiso solo una vez (cuando la aplicación se carga)
  solicitarPermiso(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      // Si está en "default", solicitamos permiso
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
    } else if (Notification.permission === 'denied') {
      // Si está en "denied", también volvemos a solicitar el permiso
      console.log('El permiso fue previamente denegado, pidiendo nuevamente...');
      Notification.requestPermission().then(permission => {
        console.log('Estado del permiso de notificación después de solicitarlo nuevamente:', permission);
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
