import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Responsable } from '../../interfaces/responsable.interface';
import { CommonModule } from '@angular/common';
import { ResponsablesService } from '../../services/responsables.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Usuario } from '../../interfaces/usuario.model';
import { Router } from '@angular/router';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AccessControlService } from '../../../shared/services/access-control.service';
import { Subscription } from 'rxjs';
import { SwalRw } from '../../../shared/helpers/swal-rw.helper';

@Component({
  selector: 'app-seleccionar-responsable-page',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule, ButtonModule, FormsModule],
  templateUrl: './seleccionar-responsable-page.component.html',
  styleUrl: './seleccionar-responsable-page.component.scss'
})
export default class SeleccionarResponsablePageComponent implements OnInit, OnDestroy {
  responsablesService = inject(ResponsablesService);
  usersService = inject(UsersService);
  authService = inject(AuthService);
  accessControl = inject(AccessControlService);

  responsableActivoSeleccionado?: Responsable | any;
  resposablesDeSucursal: Responsable[] = [];
  usuario!: Usuario;
  idSucursalSeleccionada: string = '';

  @ViewChild('pinInput') pinInput!: ElementRef<HTMLInputElement>;

  pinIngresado = '';
  errorPin = '';
  responsableSeleccionado: any = null;

  readonly maxIntentos = 3;
  intentosFallidos = 0;
  bloqueando = false;

  private usuariosSub?: Subscription;
  private responsablesSub?: Subscription;

  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.removeItem('responsable-tareas');
    this.accessControl.inicializarEscuchaUsuario();

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk') || '{}');
    if (this.usuario?.bloqueado || this.usuario?.eliminado) {
      this.cerrarSesionYRedirigir();
      return;
    }

    this.intentosFallidos = Number(this.usuario?.intentos ?? 0) || 0;
    this.idSucursalSeleccionada = this.usuario?.sucursales?.[0]?.id || '';

    const idUsuarioLogueado = String(this.usuario?.id ?? '').trim();
    if (idUsuarioLogueado) {
      this.usuariosSub = this.usersService.usuarios$.subscribe((usuarios) => {
        const usuarioFb = usuarios.find((u) => String(u.id ?? '').trim() === idUsuarioLogueado);
        if (!usuarioFb) return;

        this.usuario = { ...this.usuario, ...usuarioFb };
        this.intentosFallidos = Number(usuarioFb.intentos ?? 0) || 0;
        localStorage.setItem('rwuserdatatk', JSON.stringify(this.usuario));

        if (!this.bloqueando && (usuarioFb.bloqueado || usuarioFb.eliminado)) {
          this.cerrarSesionYRedirigir();
        }
      });
    }

    this.responsablesSub = this.responsablesService.responsables$.subscribe(() => {
      this.resposablesDeSucursal = this.responsablesService.filtrarPorSucursal(this.idSucursalSeleccionada, false);
    });
  }

  ngOnDestroy(): void {
    this.usuariosSub?.unsubscribe();
    this.responsablesSub?.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.pinInput?.nativeElement.focus();
    }, 0);
  }

  onPinChange(): void {
    if (this.bloqueando) return;

    // Limpiar caracteres no numéricos
    this.pinIngresado = this.pinIngresado.replace(/\D/g, '').slice(0, 4);
    this.errorPin = '';

    // Autovalidación al completar los 4 dígitos
    if (this.pinIngresado.length === 4) {
      this.validarPin();
    }
  }

  async validarPin() {
    if (this.pinIngresado.length !== 4 || this.bloqueando) return;

    const idUsuarioLogueado = String(this.usuario?.id ?? '').trim();
    if (!idUsuarioLogueado) {
      this.errorPin = 'No se encontró el usuario logueado';
      this.pinIngresado = '';
      return;
    }

    const responsable = this.responsablesService.responsables.find(
      (r) =>
        r.pin === this.pinIngresado &&
        r.eliminado === false &&
        String(r.idUsuario ?? '').trim() === idUsuarioLogueado
    );

    if (!responsable) {
      const pinDeOtroUsuario = this.responsablesService.buscarPorPin(this.pinIngresado);
      const nuevosIntentos = (Number(this.usuario?.intentos ?? this.intentosFallidos) || 0) + 1;
      this.intentosFallidos = nuevosIntentos;
      this.usuario.intentos = nuevosIntentos;
      this.pinIngresado = '';

      if (nuevosIntentos >= this.maxIntentos) {
        await this.bloquearUsuarioPorIntentos(idUsuarioLogueado, nuevosIntentos);
        return;
      }

      try {
        await this.usersService.updateUserPinAttempts(idUsuarioLogueado, nuevosIntentos);
        localStorage.setItem('rwuserdatatk', JSON.stringify(this.usuario));
      } catch (error) {
        console.error('Error al actualizar intentos en Firebase:', error);
      }

      const intentosRestantes = this.maxIntentos - nuevosIntentos;
      const motivo = pinDeOtroUsuario
        ? 'El PIN no pertenece al usuario logueado'
        : 'PIN incorrecto';
      this.errorPin = `${motivo}. Intentos restantes: ${intentosRestantes}`;
      return;
    }

    if ((Number(this.usuario?.intentos ?? this.intentosFallidos) || 0) > 0) {
      try {
        await this.usersService.updateUserPinAttempts(idUsuarioLogueado, 0);
        this.usuario.intentos = 0;
        this.intentosFallidos = 0;
        localStorage.setItem('rwuserdatatk', JSON.stringify(this.usuario));
      } catch (error) {
        console.error('Error al reiniciar intentos en Firebase:', error);
      }
    }

    this.errorPin = '';
    this.responsableSeleccionado = responsable;

    localStorage.setItem(
      'responsable-tareas',
      JSON.stringify(responsable)
    );

    await this.accessControl.ensureLoaded();
    const rutaDestino = this.accessControl.getPrimeraRutaPermitida() || '/main/sin-acceso';
    this.router.navigate([rutaDestino]);
  }

  private async bloquearUsuarioPorIntentos(idUsuario: string, intentos: number): Promise<void> {
    this.bloqueando = true;
    this.errorPin = 'Usuario bloqueado por exceder el número de intentos.';

    try {
      await this.usersService.updateUserPinAttempts(idUsuario, intentos, true);
    } catch (error) {
      console.error('Error al bloquear el usuario en Firebase:', error);
    }

    await SwalRw.alert({
      variant: 'critical',
      badge: 'Acceso bloqueado',
      title: 'Usuario bloqueado',
      htmlMessage: `Has alcanzado el límite de <strong>${this.maxIntentos} intentos fallidos</strong> al ingresar tu PIN. Por seguridad, tu cuenta ha sido bloqueada temporalmente.`,
      callout: 'Contacta a un administrador para desbloquear tu usuario y restablecer el acceso al sistema.',
      confirmButtonText: 'ENTENDIDO'
    });

    await this.cerrarSesionYRedirigir();
  }

  private async cerrarSesionYRedirigir(): Promise<void> {
    localStorage.removeItem('rwuserdatatk');
    localStorage.removeItem('responsable-tareas');
    this.accessControl.limpiarPermisos();
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    this.router.navigate(['/auth/login']);
  }

  cancelar() {
    this.router.navigate(['/auth/login']);
  }
}
