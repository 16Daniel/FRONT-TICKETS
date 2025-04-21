import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

import { environment } from '../../../environments/environments';
import { DocumentsService } from '../../services/documents.service';
import { VersionButtonComponent } from '../version-button/version-button.component';
import { Sucursal } from '../../models/sucursal.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarModule, VersionButtonComponent, ButtonModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent implements OnInit {
  items: MenuItem[] = [];
  showmenu: boolean = false;
  usuario: Usuario;
  urlbase: string = '';
  // sucursal: Sucursal | undefined;
  tituloBanner: string;
  
  constructor(
    public cdr: ChangeDetectorRef,
    private router: Router,
    public documentsService: DocumentsService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    if(this.usuario.idRol == '2') {
      this.tituloBanner = this.usuario.sucursales[0].nombre;
    }
    else {
      this.tituloBanner = `${ this.usuario.nombre } ${ this.usuario.apellidoP }`;
    }

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
}
