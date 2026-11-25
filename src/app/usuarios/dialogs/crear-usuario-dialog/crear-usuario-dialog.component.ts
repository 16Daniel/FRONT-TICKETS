import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { Usuario } from '../../models/usuario.model';
import { Responsable } from '../../models/responsable.model';
import { Area } from '../../../areas/interfaces/area.model';
import { UsuariosService } from '../../services/usuarios.service';
import { ResponsablesService } from '../../services/responsables.service';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { RolesService } from '../../../roles/services/roles.service';
import { AreasService } from '../../../areas/services/areas.service';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { Rol } from '../../../roles/models/rol.model';
import { CrearResponsableDialogComponent } from '../crear-responsable-dialog/crear-responsable-dialog.component';

@Component({
  selector: 'app-crear-usuario-dialog',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    DropdownModule,
    TooltipModule,
    CrearResponsableDialogComponent
  ],
  templateUrl: './crear-usuario-dialog.component.html',
  styleUrl: './crear-usuario-dialog.component.scss'
})

export class CrearUsuarioDialogComponent implements OnInit, OnDestroy {
  @Input() mostrarModalCrearUsuario: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() usuario: Usuario = new Usuario;
  @Input() esNuevoUsuario: boolean = true;
  sucursales: Sucursal[] | any[] = [];
  roles: Rol[] = [];
  areas: Area[] = [];
  responsablesUsuario: Responsable[] = [];
  mostrarModalResponsable: boolean = false;
  esNuevoResponsable: boolean = true;
  responsableSeleccionado: Responsable = new Responsable();
  regenerandoPinId: string | null = null;

  usuarioEnSesion: Usuario;
  private rolOriginal: string = '';
  private areaOriginal: string = '';
  private areasSub?: Subscription;
  private sucursalesSub?: Subscription;
  private rolesSub?: Subscription;
  private responsablesSub?: Subscription;

  constructor(
    private messageService: MessageService,
    private UsuariosService: UsuariosService,
    private responsablesService: ResponsablesService,
    private cdr: ChangeDetectorRef,
    private branchesService: SucursalesService,
    private usuarioSucursalService: UsuarioSucursalService,
    private rolesService: RolesService,
    private areasService: AreasService,
  ) {
    this.usuario = this.usuario.idRol ? this.usuario : new Usuario;
    this.usuarioEnSesion = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.usuario.idRol = this.usuario.idRol ? String(this.usuario.idRol) : '';
    this.usuario.idArea = this.usuario.idArea ? String(this.usuario.idArea) : '';
    this.usuario.idSucursal = this.usuario.idSucursal ? String(this.usuario.idSucursal) : '';

    if (!this.esNuevoUsuario && this.usuario.id) {
      this.cargarResponsablesUsuario();
    }

    this.rolOriginal = this.usuario.idRol;
    this.areaOriginal = this.usuario.idArea;

    this.obtenerAreas();
    this.obtenerSucursales();
    this.obtenerRoles();
    if (this.usuarioEnSesion.idRol == '5')
      this.usuario.idArea = String(this.usuarioEnSesion.idArea || '');
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.areasSub?.unsubscribe();
    this.sucursalesSub?.unsubscribe();
    this.rolesSub?.unsubscribe();
    this.responsablesSub?.unsubscribe();
  }

  private cargarResponsablesUsuario(): void {
    this.responsablesService.initListener();
    this.responsablesSub?.unsubscribe();
    this.responsablesSub = this.responsablesService.responsables$.subscribe((responsables) => {
      this.responsablesUsuario = responsables
        .filter((r) => !r.eliminado && String(r.idUsuario) === String(this.usuario.id))
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      this.cdr.detectChanges();
    });
  }

  abrirModalAgregarResponsable(): void {
    if (!this.usuario.id || !this.usuario.idSucursal) return;
    const nuevo = new Responsable();
    nuevo.idUsuario = String(this.usuario.id);
    nuevo.idSucursal = String(this.usuario.idSucursal);
    this.responsableSeleccionado = nuevo;
    this.esNuevoResponsable = true;
    this.mostrarModalResponsable = true;
    this.cdr.detectChanges();
  }

  abrirModalEditarResponsable(responsable: Responsable): void {
    this.responsableSeleccionado = { ...responsable };
    this.esNuevoResponsable = false;
    this.mostrarModalResponsable = true;
    this.cdr.detectChanges();
  }

  cerrarModalResponsable(): void {
    this.mostrarModalResponsable = false;
    this.responsableSeleccionado = new Responsable();
    this.cdr.detectChanges();
  }

  obtenerInicialesResponsable(nombre: string): string {
    const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  async regenerarPinResponsable(responsable: Responsable): Promise<void> {
    if (!responsable.id || this.regenerandoPinId) return;

    const confirmacion = await Swal.fire({
      title: '¿Regenerar PIN?',
      text: `Se generará un nuevo PIN para "${responsable.nombre}" y se enviará a ${responsable.correo}. El PIN anterior dejará de funcionar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regenerar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d3152a',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      customClass: {
        container: 'swal-topmost',
      },
    });

    if (!confirmacion.isConfirmed) return;

    this.regenerandoPinId = responsable.id;
    this.cdr.detectChanges();

    try {
      const nuevoPin = await this.responsablesService.generarPinUnico();
      await this.responsablesService.update({ pin: nuevoPin }, responsable.id);
      responsable.pin = nuevoPin;
      this.showMessage('success', 'Actualizado', 'PIN regenerado');

      const nombreSucursal =
        this.sucursales.find(
          (s: any) => String(s.id) === String(responsable.idSucursal || this.usuario.idSucursal)
        )?.nombre || '';

      this.responsablesService
        .enviarCorreoPin(responsable, nombreSucursal, nuevoPin)
        .subscribe({
          next: () => {
            this.showMessage('success', 'Success', 'Email enviado');
          },
          error: (err) => {
            console.error('Error al enviar correo', err);
          },
        });
    } catch (error) {
      console.error('Error al regenerar PIN:', error);
      this.showMessage('error', 'Error', 'No se pudo regenerar el PIN');
    } finally {
      this.regenerandoPinId = null;
      this.cdr.detectChanges();
    }
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    this.usuario.idSucursal = this.usuario.idSucursal ? String(this.usuario.idSucursal) : '';

    this.esNuevoUsuario ? this.guardarAutenticacionFb() : this.actualizarUsuario();
  }

  /**
 * Guarda al usuario en la autenticaciond e firebase
 * @returns
 */
  async guardarAutenticacionFb() {
    try {
      const uid = await this.UsuariosService.registerAuthFirebaseUser(
        this.usuario.email!,
        this.usuario.password!
      );
      if (uid != null) {
        this.guardarUsuario(uid);
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      this.showMessage('error', 'Error', error.toString());
    }
  }

  /**
   * Guardar al usuario en la tabla de usuarios
   * @param uid
   */
  async guardarUsuario(uid: string) {
    this.usuario.uid = uid;
    this.usuario.idArea = this.usuario.idArea ? this.usuario.idArea.toString() : '';
    this.usuario.idSucursal = this.usuario.idSucursal ? this.usuario.idSucursal.toString() : '';

    try {
      await this.UsuariosService.create({ ...this.usuario });
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }

    this.cdr.detectChanges();
    this.closeEvent.emit(false); // Cerrar modal
    this.showMessage('success', 'Success', 'Guardado correctamente');
  }

  async actualizarUsuario() {
    this.usuario.idArea = this.usuario.idArea ? this.usuario.idArea.toString() : '';
    this.usuario.idSucursal = this.usuario.idSucursal ? this.usuario.idSucursal.toString() : '';

    try {
      await this.UsuariosService.update(this.usuario.id, { ...this.usuario });

      const dejoDeSerAnalistaDelArea =
        this.rolOriginal === '4' &&
        (String(this.usuario.idRol) !== '4' ||
          String(this.usuario.idArea) !== this.areaOriginal);

      if (dejoDeSerAnalistaDelArea) {
        await this.usuarioSucursalService.quitarRelacionesDeUsuario(
          this.usuario.id,
          'SOPORTE'
        );
      }

      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Enviado correctamente');
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      this.showMessage('error', 'Error', 'No se pudo actualizar el usuario');
    }
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerAreas() {
    this.areasService.initListener();
    this.areasSub = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas
        .filter((a: Area) => !a.eliminado)
        .map((a: Area) => ({ ...a, id: String(a.id) }));
      this.cdr.detectChanges();
    });
  }

  obtenerSucursales() {
    this.sucursalesSub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({ nombre: item.nombre, id: item.id.toString() }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerRoles() {
    this.rolesSub = this.rolesService.get().subscribe({
      next: (data) => {
        this.roles = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
}
