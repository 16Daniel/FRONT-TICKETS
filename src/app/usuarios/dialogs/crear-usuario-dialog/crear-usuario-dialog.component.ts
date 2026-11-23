import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';

import { Usuario } from '../../models/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { UsuariosService } from '../../services/usuarios.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { RolesService } from '../../../roles/services/roles.service';
import { AreasService } from '../../../areas/services/areas.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Rol } from '../../../roles/interfaces/rol.model';

@Component({
  selector: 'app-crear-usuario-dialog',
  standalone: true,
  imports: [DialogModule, FormsModule, MultiSelectModule, CommonModule, DropdownModule],
  templateUrl: './crear-usuario-dialog.component.html',
  styleUrl: './crear-usuario-dialog.component.scss'
})

export class CrearUsuarioDialogComponent implements OnInit, OnDestroy {
  @Input() mostrarModalCrearUsuario: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() usuario: Usuario = new Usuario;
  @Input() esNuevoUsuario: boolean = true;
  @Input() choferCedis: boolean = false;
  sucursales: Sucursal[] | any[] = [];
  sucursalesChoferIds: string[] = [];
  roles: Rol[] = [];
  areas: Area[] = [];

  usuarioEnSesion: Usuario;
  private rolOriginal: string = '';
  private areaOriginal: string = '';
  private sucursalesChoferCargadas: boolean = false;
  private areasSub?: Subscription;
  private sucursalesSub?: Subscription;
  private rolesSub?: Subscription;
  private usuarioSucursalSub?: Subscription;

  constructor(
    private messageService: MessageService,
    private UsuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
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

    if (!this.choferCedis) {
      this.usuario.idSucursal = this.UsuariosService.obtenerIdSucursalUsuario(this.usuario);
    } else if (this.usuario.id) {
      this.usuarioSucursalSub = this.usuarioSucursalService.usuarioSucursal$.subscribe(() => {
        if (this.sucursalesChoferCargadas) return;
        this.sucursalesChoferIds = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
          'RECOLECCION_ACEITE',
          String(this.usuario.id),
          this.usuario.idArea
        );
        this.sucursalesChoferCargadas = true;
        this.cdr.detectChanges();
      });
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
    this.usuarioSucursalSub?.unsubscribe();
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    if (!this.choferCedis) {
      this.usuario.idSucursal = this.usuario.idSucursal ? String(this.usuario.idSucursal) : '';
    }

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
      const nuevoId = await this.UsuariosService.create({ ...this.usuario });
      if (this.choferCedis && nuevoId) {
        await this.usuarioSucursalService.guardarSucursalesDeUsuario(
          'RECOLECCION_ACEITE',
          this.usuario.idArea,
          nuevoId,
          this.sucursalesChoferIds
        );
      }
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

      if (this.choferCedis) {
        await this.usuarioSucursalService.guardarSucursalesDeUsuario(
          'RECOLECCION_ACEITE',
          this.usuario.idArea,
          String(this.usuario.id),
          this.sucursalesChoferIds
        );
      }

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
