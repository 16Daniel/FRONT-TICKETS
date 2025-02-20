import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../shared/side-menu/side-menu.component';
import { Router } from '@angular/router';
import { UsuarioLogin } from '../../models/usuario-login.model';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideMenuComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainComponent implements OnInit {
  public userdata:UsuarioLogin|undefined; 
  constructor(private router: Router)
  { 
    if(localStorage.getItem("rwuserdatatk") == null)
    {
      this.router.navigate(["/auth"]);
    }
  }

  ngOnInit(): void 
  {
    if ('Notification' in window) {
      // Verifica si el navegador soporta las notificaciones
      if (Notification.permission === 'granted') {
          // Si ya se concedieron permisos, puedes mostrar una notificación
       
      } else if (Notification.permission !== 'denied') {
          // Si no se han concedido ni denegado, solicita los permisos
          Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                  
              } else {
                  console.log('Permisos denegados');
              }
          });
      }
  } else {
      console.log('Las notificaciones no están soportadas en este navegador.');
  }  

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado con éxito:', registration);
        })
        .catch(error => {
            // console.error('Error al registrar el Service Worker:', error);
        });
} else {
    console.log('Service Worker no es compatible en este navegador.');
}



   }

}
