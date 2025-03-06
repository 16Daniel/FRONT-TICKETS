import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { NotFoundError, Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { environment } from '../../../environments/enviroments';
import { Notificacion } from '../../models/notificacion.model';
import { NotificationsService } from '../../services/notifications.service';
import { DocumentsService } from '../../services/documents.service';
import { VersionButtonComponent } from '../version-button/version-button.component';
@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule,
    MenuModule,
    SidebarModule,
    FormsModule,
    OverlayPanelModule,
    MessagesModule,
    DialogModule,
    MenubarModule,
    VersionButtonComponent
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent implements OnInit {
  public items: MenuItem[] = [];
  public contador: number = 1;
  public showmenu: boolean = false;
  public notificaciones: Notificacion[] = [];
  public subscriptionnt: Subscription | undefined;
  public userdata: any;
  public urlbase: string = '';

  constructor(
    public cdr: ChangeDetectorRef,
    private router: Router,
    public documentsService: DocumentsService,
    private notificationsService: NotificationsService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;
    this.getNotifiaciones(idu);
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        route: '/home',
      },
      {
        label: 'Metas',
        icon: 'pi pi-bullseye',
        route: '/metas',
      },
    ];

    let origin = window.location.origin;
    let url = '';

    if (environment.production == true) {
      url = '/front/tickets';
    }
    this.urlbase = origin + url + '/#/main/ticket/';
  }

  logout() {
    localStorage.removeItem('rwuserdatatk');
    localStorage.removeItem('catRutastk');
    this.router.navigate(['/auth/login']);
  }

  closemenu() {
    this.showmenu = false;
  }

  getdate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  async getNotifiaciones(userid: string): Promise<void> {
    this.subscriptionnt = this.notificationsService
      .getNotificaciones(userid)
      .subscribe({
        next: (data) => {
          this.notificaciones = data;

          this.notificaciones = this.notificaciones.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          let nsl = this.notificaciones.filter((x) => x.abierta == false);
          for (let item of nsl) {
            // if ('serviceWorker' in navigator) {
            //   navigator.serviceWorker
            //     .register('service-worker.js')
            //     .then((registration) => {
            //       // Mostrar una notificación usando el Service Worker

            //       if (item.notificado == false) {
            //         registration.showNotification(item.titulo, {
            //           body: item.mensaje,
            //           icon: 'https://operamx.no-ip.net/front/tickets/assets/img/RW_LogoWEB.png', // URL del icono
            //           data: { urltk: this.urlbase + item.idTicket },
            //         });

            //         item.notificado = true;
            //         this.updateNotificacion(item);
            //       }
            //     })
            //     .catch((error) => {
            //       console.error('Error al registrar el Service Worker:', error);
            //     });
            // } else {
            //   console.log('Service Worker no es compatible en este navegador.');
            // }
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al escuchar las notificaciones:', error);
        },
      });
  }

  ngOnDestroy() {
    if (this.subscriptionnt != undefined) {
      this.subscriptionnt.unsubscribe();
    }
  }

  getBgNt(value: string) {
    let bgs: boolean = false;
    let bgp: boolean = false;
    let bgd: boolean = false;

    if (value == 'NUEVO TICKET') {
      bgs = true;
    }

    if (value == 'NUEVO COMENTARIO') {
      bgp = true;
    }

    if (value == 'ALERTA DE PÁNICO') {
      bgd = true;
    }

    return {
      'bg-success': bgs,
      'bg-primary': bgp,
      'bg-danger': bgd,
    };
  }

  updateNotificacion(nt: Notificacion) {
    this.documentsService.updateDoc('Notificaciones', nt);
  }

  showticket(item: Notificacion) {
    item.abierta = true;
    this.updateNotificacion(item);

    let origin = window.location.origin;
    let url = '';

    if (environment.production == true) {
      url = '/front/tickets';
    }

    window.open(origin + url + '/#/main/ticket/' + item.idTicket, '_blank');
  }

  getNotificacionesNuevas(): Notificacion[] {
    return this.notificaciones.filter((x) => x.abierta == false);
  }

  getNotificacionesAbiertas(): Notificacion[] {
    return this.notificaciones.filter((x) => x.abierta == true);
  }

  borrarNt(id: string) {
    this.documentsService.deleteDocument('Notificaciones', id);
  }
}
