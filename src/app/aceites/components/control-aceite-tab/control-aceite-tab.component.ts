import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { DocumentsService } from '../../../shared/services/documents.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { RolesService } from '../../../roles/services/roles.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Rol } from '../../../roles/interfaces/rol.model';
import { CrearUsuarioDialogComponent } from '../../../usuarios/dialogs/crear-usuario-dialog/crear-usuario-dialog.component';

@Component({
  selector: 'app-control-aceite-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    TableModule,
    TooltipModule,
    CrearUsuarioDialogComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './control-aceite-tab.component.html',
  styleUrl: './control-aceite-tab.component.scss',
})
export default class ControlAceiteTabComponent implements OnInit, OnDestroy {
  public sucursales: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public loading: boolean = false;
  mostrarModalUsuario: boolean = false;
  actualizar: boolean = false;
  catusuarios: Usuario[] = [];
  usuariosel: Usuario | undefined;
  roles: Rol[] = [];
  usuarioSeleccionado: Usuario | any = new Usuario();
  esNuevoUsuario: boolean = false;

  private subscripcionUsuarios?: Subscription;
  private subscripcionRoles?: Subscription;

  constructor(
    public documentsService: DocumentsService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private branchesService: BranchesService,
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerUsuarios();
    this.obtenerRoles();
  }

  ngOnDestroy(): void {
    this.subscripcionUsuarios?.unsubscribe();
    this.subscripcionRoles?.unsubscribe();
  }

  async obtenerSucursales(): Promise<void> {
    this.loading = true;
    try {
      this.sucursales = await this.branchesService.getOnce();
      this.sucursalesSel = this.sucursales.filter(suc => suc.controlDeAceite === true);
    } catch (error) {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al cargar las sucursales');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  obtenerNombreRol(idRol: string): string {
    const rol = this.roles.find((x) => x.id == idRol);
    return rol ? rol.nombre : '';
  }

  obtenerIniciales(usuario: Usuario): string {
    const n = (usuario.nombre || '').trim().charAt(0);
    const a = (usuario.apellidoP || '').trim().charAt(0);
    return (n + a).toUpperCase() || 'U';
  }

  abrirModalCrearUsuario(): void {
    this.esNuevoUsuario = true;
    this.mostrarModalUsuario = true;
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuarios(): void {
    this.subscripcionUsuarios?.unsubscribe();
    this.subscripcionUsuarios = this.usuariosService.usuarios$.subscribe((usuarios) => {
      this.catusuarios = usuarios.filter(x => x.idRol == '6');
      this.cdr.detectChanges();
    });
  }

  abrirModalEditarUsuario(usuario: Usuario): void {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = usuario;
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.usuarioSeleccionado = new Usuario();
  }

  obtenerRoles(): void {
    this.subscripcionRoles?.unsubscribe();
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

  async actualizarSucursales(): Promise<void> {
    this.loading = true;
    try {
      const selectedIds = new Set(this.sucursalesSel.map(s => s.id));
      const sucursalesActualizadas = this.sucursales.map(suc => ({
        ...suc,
        controlDeAceite: selectedIds.has(suc.id),
      }));

      await this.branchesService.updateMultiple(sucursalesActualizadas);
      await this.obtenerSucursales();
      this.showMessage('success', 'Correcto', 'Sucursales actualizadas correctamente');
    } catch (error) {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al actualizar las sucursales');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
