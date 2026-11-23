import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';

import { Usuario } from '../../models/usuario.model';
import { DocumentsService } from '../../../shared/services/documents.service';
import { UsuariosService } from '../../services/usuarios.service';
import { RolesService } from '../../../roles/services/roles.service';
import { Rol } from '../../../roles/interfaces/rol.model';
import { CrearUsuarioDialogComponent } from '../../dialogs/crear-usuario-dialog/crear-usuario-dialog.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    TooltipModule,
    InputTextModule,
    CrearUsuarioDialogComponent,
    PageHeaderComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios-page.component.html',
  styleUrl: './usuarios-page.component.scss'
})

export default class UsuariosPageComponent implements OnDestroy, OnInit {
  readonly String = String;
  mostrarModalUsuario: boolean = false;
  actualizar: boolean = false;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuariosel: Usuario | undefined;
  roles: Rol[] = [];
  usuarioSeleccionado: Usuario | any = new Usuario;
  esNuevoUsuario: boolean = false;
  subscripcionUsuarios: Subscription | undefined;
  private subscripcionAreas?: Subscription;
  private subscripcionSucursales?: Subscription;
  private subscripcionSoporte?: Subscription;
  private subscripcionRoles?: Subscription;
  private unsubscribe!: () => void;

  areas: Area[] = [];
  sucursalesMap: Record<string, string> = {};
  areaSeleccionadaId: string = 'sin-area';
  confirmDialogTipo: 'eliminar' | 'desbloquear' = 'eliminar';

  usuario: Usuario;

  constructor(
    public documentsService: DocumentsService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private UsuariosService: UsuariosService,
    private rolesService: RolesService,
    private areasService: AreasService,
    private branchesService: BranchesService,
    private usuarioSucursalService: UsuarioSucursalService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.subscripcionUsuarios = this.UsuariosService.usuarios$.subscribe(usuarios => {
      this.usuarios = usuarios.filter(u => !u.eliminado);
      if (this.usuario.idRol == '5') {
        this.usuarios = this.usuarios.filter(x => x.idArea == this.usuario.idArea);
      }
      this.asegurarAreaSeleccionadaValida();
      this.aplicarFiltroArea();
    });
    this.cargarAreas();
    this.cargarSucursales();
    this.cargarSoporteSucursales();
    this.obtenerRoles();
  }

  private cargarSucursales(): void {
    this.subscripcionSucursales = this.branchesService.get().subscribe((sucursales) => {
      const mapa: Record<string, string> = {};
      for (const s of sucursales) {
        mapa[String(s.id)] = s.nombre;
      }
      this.sucursalesMap = mapa;
      this.cdr.detectChanges();
    });
  }

  private cargarSoporteSucursales(): void {
    this.subscripcionSoporte = this.usuarioSucursalService.usuarioSucursal$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      this.asegurarAreaSeleccionadaValida();
      this.aplicarFiltroArea();
      this.cdr.detectChanges();
    });
  }

  private esUsuarioSinArea(u: Usuario): boolean {
    return !u.idArea || String(u.idArea) === '0' || String(u.idArea) === '';
  }

  get tieneUsuariosSinArea(): boolean {
    return this.usuarios.some(u => this.esUsuarioSinArea(u));
  }

  private asegurarAreaSeleccionadaValida(): void {
    if (this.areaSeleccionadaId === 'sin-area' && !this.tieneUsuariosSinArea && this.areas.length > 0) {
      this.areaSeleccionadaId = String(this.areas[0].id);
      return;
    }
    if (this.areaSeleccionadaId !== 'sin-area' && this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
      this.areaSeleccionadaId = this.tieneUsuariosSinArea ? 'sin-area' : String(this.areas[0].id);
    }
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.aplicarFiltroArea();
  }

  aplicarFiltroArea(): void {
    if (this.areaSeleccionadaId === 'sin-area') {
      this.usuariosFiltrados = this.usuarios.filter(u => this.esUsuarioSinArea(u));
    } else {
      this.usuariosFiltrados = this.usuarios.filter(u => String(u.idArea) === this.areaSeleccionadaId);
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.subscripcionUsuarios != undefined) {
      this.subscripcionUsuarios.unsubscribe();
    }
    if (this.subscripcionAreas) {
      this.subscripcionAreas.unsubscribe();
    }
    if (this.subscripcionSucursales) {
      this.subscripcionSucursales.unsubscribe();
    }
    if (this.subscripcionSoporte) {
      this.subscripcionSoporte.unsubscribe();
    }
    if (this.subscripcionRoles) {
      this.subscripcionRoles.unsubscribe();
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  obtenerSucursalesSoporte(usuario: Usuario): string[] {
    if (String(usuario.idRol) !== '4' || !usuario.id) return [];
    const ids = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
      'SOPORTE',
      String(usuario.id),
      usuario.idArea
    );
    return ids
      .map((id) => this.sucursalesMap[id] || `Sucursal #${id}`)
      .sort((a, b) => a.localeCompare(b));
  }

  obtenerTooltipSoporte(usuario: Usuario): string {
    if (String(usuario.idRol) !== '4' || !usuario.id) {
      return 'Sin sucursales de soporte asignadas';
    }
    const detalle = this.usuarioSucursalService.obtenerDetalleSucursalesPorUsuario(
      'SOPORTE',
      String(usuario.id),
      usuario.idArea
    );
    if (detalle.length === 0) {
      return 'Sin sucursales de soporte asignadas';
    }
    return detalle
      .map((item) => {
        const nombre = this.sucursalesMap[item.idSucursal] || `Sucursal #${item.idSucursal}`;
        return item.esPrincipal ? `${nombre} (Principal)` : nombre;
      })
      .sort((a, b) => a.localeCompare(b))
      .join(', ');
  }

  abrirModalCrearUsuario() {
    this.esNuevoUsuario = true;
    this.mostrarModalUsuario = true;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerNombreRol(idRol: string): string {
    let name = '';
    let rol = this.roles.filter((x) => x.id == idRol);
    if (rol.length > 0) {
      name = rol[0].nombre;
    }
    return name;
  }

  confirmaEliminacion(id: string | any) {
    this.confirmDialogTipo = 'eliminar';
    this.confirmationService.confirm({
      header: '¿Eliminar usuario?',
      message: '¿Está seguro que desea eliminar este usuario?',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.eliminarUsuario(id);
      },
      reject: () => { },
    });
  }

  abrirModalEditarUsuario(usuario: Usuario) {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = { ...usuario };
    this.mostrarModalUsuario = true;
  }

  async eliminarUsuario(idu: string) {
    try {
      await this.UsuariosService.updateUserDeletedStatus(idu, true);
      await this.usuarioSucursalService.quitarRelacionesDeUsuario(idu);
      this.showMessage('success', 'Success', 'Eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      this.showMessage('error', 'Error', 'No se pudo eliminar el usuario');
    }
  }

  confirmaDesbloqueo(usuario: Usuario) {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`.trim();
    this.confirmDialogTipo = 'desbloquear';
    this.confirmationService.confirm({
      header: '¿Desbloquear usuario?',
      message: `¿Está seguro que desea desbloquear a "${nombreCompleto || usuario.email}"?`,
      acceptLabel: 'Sí, desbloquear',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-lock-open',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.desbloquearUsuario(usuario);
      },
      reject: () => { },
    });
  }

  async desbloquearUsuario(usuario: Usuario) {
    try {
      await this.UsuariosService.updateUserPinAttempts(usuario.id, 0, false);
      this.showMessage('success', 'Usuario desbloqueado', 'El usuario fue desbloqueado y sus intentos se reiniciaron.');
    } catch (error) {
      console.error('Error al desbloquear usuario:', error);
      this.showMessage('error', 'Error', 'No se pudo desbloquear el usuario');
    }
  }

  obtenerRoles() {
    this.subscripcionRoles = this.rolesService.get().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  cerrarModalUsuario() {
    this.mostrarModalUsuario = false;
    this.usuarioSeleccionado = new Usuario;
  }
}
