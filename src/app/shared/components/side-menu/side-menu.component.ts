import { ChangeDetectionStrategy, Component, type OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

import { DocumentsService } from '../../services/documents.service';
import { VersionButtonComponent } from '../version-button/version-button.component';
import { ChatNotificationsButtonComponent } from '../chat-notifications-button/chat-notifications-button.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { environment } from '../../../../environments/environments';
import { ResponsableTarea } from '../../../tareas/interfaces/responsable-tarea.interface';
import { AvatarModule } from 'ngx-avatars';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MenubarModule, 
    VersionButtonComponent, 
    ButtonModule, 
    ChatNotificationsButtonComponent, 
    AvatarModule,
    RouterLink
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SideMenuComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  showmenu: boolean = false;
  isPinned: boolean = true;
  usuario: Usuario;
  urlbase: string = '';
  tituloBanner: string;

  responsableTarea!: ResponsableTarea;

  constructor(
    public cdr: ChangeDetectorRef,
    private router: Router,
    public documentsService: DocumentsService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.responsableTarea = JSON.parse(localStorage.getItem('responsable-tareas')!);

    if (this.usuario.idRol == '2') {
      this.tituloBanner = this.usuario.sucursales[0].nombre;
    }
    else {
      this.tituloBanner = `${this.usuario.nombre} ${this.usuario.apellidoP}`;
    }
  }

  ngOnInit(): void {
    // Read pinned status from localStorage (default to true)
    const savedPin = localStorage.getItem('rw_sidebar_pinned');
    this.isPinned = savedPin !== null ? savedPin === 'true' : true;

    if (this.isPinned && window.innerWidth > 1024) {
      this.showmenu = true;
    }

    this.updateBodyPinClass();

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

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-pinned');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateBodyPinClass();
  }

  togglePin(): void {
    this.isPinned = !this.isPinned;
    localStorage.setItem('rw_sidebar_pinned', String(this.isPinned));
    if (this.isPinned) {
      this.showmenu = true;
    }
    this.updateBodyPinClass();
    this.cdr.markForCheck();
  }

  toggleMenu(): void {
    this.showmenu = !this.showmenu;
    this.updateBodyPinClass();
    this.cdr.markForCheck();
  }

  closemenu(): void {
    if (!this.isPinned || window.innerWidth <= 1024) {
      this.showmenu = false;
      this.updateBodyPinClass();
    }
    this.cdr.markForCheck();
  }

  updateBodyPinClass(): void {
    if (typeof document !== 'undefined') {
      if (this.isPinned && this.showmenu && window.innerWidth > 1024) {
        document.body.classList.add('sidebar-pinned');
      } else {
        document.body.classList.remove('sidebar-pinned');
      }
    }
  }

  logout(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-pinned');
    }
    localStorage.removeItem('rwuserdatatk');
    localStorage.removeItem('catRutastk');
    localStorage.removeItem('responsable-tareas');
    this.router.navigate(['/auth/login']);
  }
}
