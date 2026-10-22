import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../services/sidebar.service';
import { AlertNotificationsButtonComponent } from '../alert-notifications-button/alert-notifications-button.component';
import { ChatNotificationsButtonComponent } from '../chat-notifications-button/chat-notifications-button.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    AlertNotificationsButtonComponent,
    ChatNotificationsButtonComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  tituloBanner: string = '';
  isMenuOpen: boolean = false;

  private routerSub?: Subscription;
  private sidebarSub?: Subscription;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.cargarTituloBanner();
  }

  ngOnInit(): void {
    this.sidebarSub = this.sidebarService.isOpened$.subscribe(open => {
      this.isMenuOpen = open;
      this.cdr.markForCheck();
    });

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarTituloBanner();
      });
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.cargarTituloBanner();
  }

  cargarTituloBanner(): void {
    const rawUser = localStorage.getItem('rwuserdatatk');
    const usuario: Usuario | null = rawUser ? JSON.parse(rawUser) : null;

    if (usuario) {
      if (usuario.idRol == '2' && usuario.sucursales && usuario.sucursales.length > 0) {
        this.tituloBanner = usuario.sucursales[0].nombre;
      } else {
        this.tituloBanner = `${usuario.nombre || ''} ${usuario.apellidoP || ''}`.trim();
      }
    } else {
      this.tituloBanner = '';
    }
    this.cdr.markForCheck();
  }

  toggleMenu(): void {
    this.sidebarService.toggleMenu();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.sidebarSub?.unsubscribe();
  }
}
