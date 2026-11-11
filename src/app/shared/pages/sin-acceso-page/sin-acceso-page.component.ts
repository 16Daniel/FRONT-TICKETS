import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccessControlService } from '../../services/access-control.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';

@Component({
  selector: 'app-sin-acceso-page',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './sin-acceso-page.component.html',
  styleUrl: './sin-acceso-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SinAccesoPageComponent {
  public usuario: Usuario | null = null;
  public responsable: Responsable | null = null;
  public verificando: boolean = false;

  constructor(
    private router: Router,
    public accessControl: AccessControlService,
    private cdr: ChangeDetectorRef
  ) {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const rawUser = localStorage.getItem('rwuserdatatk');
    this.usuario = rawUser ? JSON.parse(rawUser) : null;

    const rawResp = localStorage.getItem('responsable-tareas');
    this.responsable = rawResp ? JSON.parse(rawResp) : null;
  }

  async reintentarAcceso(): Promise<void> {
    this.verificando = true;
    this.cdr.markForCheck();

    this.accessControl.inicializarEscuchaUsuario();
    await this.accessControl.ensureLoaded();

    setTimeout(() => {
      this.verificando = false;
      const rutaPermitida = this.accessControl.getPrimeraRutaPermitida();
      if (rutaPermitida && !rutaPermitida.includes('sin-acceso')) {
        this.router.navigate([rutaPermitida]);
      } else {
        this.cdr.markForCheck();
      }
    }, 600);
  }

  cambiarUsuarioPin(): void {
    this.router.navigate(['/usuarios/selecciona-responsable']);
  }

  logout(): void {
    this.accessControl.limpiarPermisos();
    localStorage.removeItem('rwuserdatatk');
    localStorage.removeItem('catRutastk');
    localStorage.removeItem('responsable-tareas');
    this.router.navigate(['/auth/login']);
  }
}
