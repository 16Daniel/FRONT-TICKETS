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

import { Usuario } from '../../interfaces/usuario.model';
import { DocumentsService } from '../../../shared/services/documents.service';
import { UsersService } from '../../services/users.service';
import { RolesService } from '../../../roles/services/roles.service';
import { Rol } from '../../../roles/interfaces/rol.model';
import { CrearUsuarioDialogComponent } from '../../dialogs/crear-usuario-dialog/crear-usuario-dialog.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';

@Component({
  selector: 'app-users-page',
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
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss'
})

export default class UsersPageComponent implements OnDestroy, OnInit {
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
  private unsubscribe!: () => void;

  areas: Area[] = [];
  areaSeleccionadaId: string = 'sucursales';

  usuario: Usuario;

  constructor(
    public documentsService: DocumentsService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private usersService: UsersService,
    private rolesService: RolesService,
    private areasService: AreasService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.usersService.usuarios$.subscribe(usuarios => {
      this.usuarios = usuarios;
      if (this.usuario.idRol == '5') {
        this.usuarios = this.usuarios.filter(x => x.idArea == this.usuario.idArea);
      }
      this.aplicarFiltroArea();
    });
    this.cargarAreas();
    this.obtenerRoles();
  }

  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      if (this.areaSeleccionadaId !== 'sucursales' && this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
        this.areaSeleccionadaId = 'sucursales';
      }
      this.aplicarFiltroArea();
      this.cdr.detectChanges();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.aplicarFiltroArea();
  }

  aplicarFiltroArea(): void {
    if (this.areaSeleccionadaId === 'sucursales') {
      this.usuariosFiltrados = this.usuarios.filter(u => !u.idArea || String(u.idArea) === '0' || String(u.idArea) === '');
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
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
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
    await this.documentsService.deleteDocument('usuarios', idu);
    this.showMessage('success', 'Success', 'Eliminado correctamente');
  }

  obtenerRoles() {
    this.rolesService.get().subscribe({
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
