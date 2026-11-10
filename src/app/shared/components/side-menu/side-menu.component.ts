import { ChangeDetectionStrategy, Component, type OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AvatarModule } from 'ngx-avatars';

import { DocumentsService } from '../../services/documents.service';
import { AccessControlService } from '../../services/access-control.service';
import { PwaService } from '../../services/pwa.service';
import { GrupoMenuPermiso } from '../../../roles/interfaces/ruta.model';
import { ChatNotificationsButtonComponent } from '../chat-notifications-button/chat-notifications-button.component';
import { AlertNotificationsButtonComponent } from '../alert-notifications-button/alert-notifications-button.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    TooltipModule,
    AvatarModule,
    RouterLink,
    RouterLinkActive,
    ChatNotificationsButtonComponent,
    AlertNotificationsButtonComponent
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent implements OnInit, OnDestroy {
  usuario!: Usuario;
  responsable: Responsable | null = null;
  responsableTarea: Responsable | null = null;
  tituloBanner: string = '';
  showmenu: boolean = false;
  isPinned: boolean = true;
  isCheckingValidadorConsumos: boolean = false;
  isCheckingValidadorCupones: boolean = false;
  isUpdatingApp: boolean = false;
  swUpdateAvailable: boolean = false;
  logoUrl: string = 'assets/images/Logo_rebel_UP_Horizontal_1600x600.PNG';
  readonly appVersion: string = environment.version;

  public gruposMenuVisibles$: Observable<GrupoMenuPermiso[]> = this.accessControl.gruposMenuVisibles$;
  private routerSub?: Subscription;
  private pwaUpdateSub?: Subscription;

  constructor(
    public cdr: ChangeDetectorRef,
    private router: Router,
    public documentsService: DocumentsService,
    public accessControl: AccessControlService,
    public pwaService: PwaService
  ) {
    this.cargarUsuarios();
  }

  get hayNuevaVersion(): boolean {
    return this.swUpdateAvailable;
  }

  onLogoError(): void {
    if (this.logoUrl !== '/front/tickets/assets/images/Logo_rebel_UP_Horizontal_1600x600.PNG') {
      this.logoUrl = '/front/tickets/assets/images/Logo_rebel_UP_Horizontal_1600x600.PNG';
      this.cdr.markForCheck();
    }
  }

  cargarUsuarios(): void {
    const rawUser = localStorage.getItem('rwuserdatatk');
    this.usuario = rawUser ? JSON.parse(rawUser) : null;

    const rawResp = localStorage.getItem('responsable-tareas');
    this.responsable = rawResp ? JSON.parse(rawResp) : null;
    this.responsableTarea = this.responsable;

    if (this.usuario) {
      if (this.usuario.idRol == '2' && this.usuario.sucursales && this.usuario.sucursales.length > 0) {
        this.tituloBanner = this.usuario.sucursales[0].nombre;
      } else {
        this.tituloBanner = `${this.usuario.nombre || ''} ${this.usuario.apellidoP || ''}`.trim();
      }
    } else {
      this.tituloBanner = '';
    }

    this.accessControl.inicializarEscuchaUsuario();
    this.cdr.markForCheck();
  }

  get nombreCuenta(): string {
    if (!this.usuario) return '';
    if (this.usuario.idRol === '2' && this.usuario.sucursales && this.usuario.sucursales.length > 0) {
      return this.usuario.sucursales[0].nombre;
    }
    return `${this.usuario.nombre || ''} ${this.usuario.apellidoP || ''}`.trim();
  }

  ngOnInit(): void {
    this.pwaUpdateSub = this.pwaService.updateAvailable$.subscribe((available) => {
      this.swUpdateAvailable = available;
      this.cdr.markForCheck();
    });

    this.pwaService.verificarActualizacionEnSw();

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarUsuarios();
        this.closemenu();
      });

    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('rw_sidebar_pinned') : null;
    this.isPinned = savedPin !== null ? savedPin === 'true' : true;

    if (this.isPinned && typeof window !== 'undefined' && window.innerWidth > 1024) {
      this.showmenu = true;
    }

    this.updateBodyPinClass();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.cargarUsuarios();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateBodyPinClass();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-pinned');
    }
    this.routerSub?.unsubscribe();
    this.pwaUpdateSub?.unsubscribe();
  }

  togglePin(): void {
    this.isPinned = !this.isPinned;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rw_sidebar_pinned', String(this.isPinned));
    }
    if (this.isPinned) {
      this.showmenu = true;
    }
    this.updateBodyPinClass();
    this.cdr.markForCheck();
  }

  toggleMenu(): void {
    this.showmenu = !this.showmenu;
    if (this.showmenu) {
      this.pwaService.verificarActualizacionEnSw();
    }
    this.updateBodyPinClass();
    this.cdr.markForCheck();
  }

  closemenu(): void {
    if (!this.isPinned || (typeof window !== 'undefined' && window.innerWidth <= 1024)) {
      this.showmenu = false;
      this.updateBodyPinClass();
      this.cdr.markForCheck();
    }
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

  cambiarUsuarioPin(): void {
    this.closemenu();
    this.router.navigate(['/usuarios/selecciona-responsable']);
  }

  abrirValidador(tipo: 'consumos' | 'cupones', event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (tipo === 'consumos') {
      if (this.isCheckingValidadorConsumos) return;
      this.isCheckingValidadorConsumos = true;
    } else {
      if (this.isCheckingValidadorCupones) return;
      this.isCheckingValidadorCupones = true;
    }

    this.closemenu();
    this.cdr.markForCheck();

    const targetUrl = tipo === 'consumos' ? 'http://localhost:3003/validador' : 'http://localhost:3001';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const finishCheck = (success: boolean) => {
      clearTimeout(timeoutId);
      if (tipo === 'consumos') {
        this.isCheckingValidadorConsumos = false;
      } else {
        this.isCheckingValidadorCupones = false;
      }
      this.cdr.markForCheck();

      if (success) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        this.router.navigate(['/main/validador-api-local'], { queryParams: { tipo } });
      }
    };

    fetch(targetUrl, { method: 'GET', signal: controller.signal })
      .then(() => finishCheck(true))
      .catch(() => {
        fetch(targetUrl, { method: 'GET', mode: 'no-cors', signal: controller.signal })
          .then(() => finishCheck(true))
          .catch(() => finishCheck(false));
      });
  }

  abrirValidadorConsumos(event?: Event): void {
    this.abrirValidador('consumos', event);
  }

  abrirValidadorCupones(event?: Event): void {
    this.abrirValidador('cupones', event);
  }

  async actualizarApp(): Promise<void> {
    if (this.isUpdatingApp) return;
    this.isUpdatingApp = true;
    this.cdr.markForCheck();

    await this.pwaService.actualizarApp();
  }

  logout(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-pinned');
    }
    this.accessControl.limpiarPermisos();
    localStorage.removeItem('rwuserdatatk');
    localStorage.removeItem('catRutastk');
    localStorage.removeItem('responsable-tareas');
    this.router.navigate(['/auth/login']);
  }
}
