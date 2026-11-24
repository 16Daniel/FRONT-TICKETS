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
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Rol } from '../../../roles/interfaces/rol.model';
import { AsignarSucursalesAceiteDialogComponent } from '../../dialogs/asignar-sucursales-aceite-dialog/asignar-sucursales-aceite-dialog.component';

@Component({
  selector: 'app-control-aceite-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    TableModule,
    TooltipModule,
    AsignarSucursalesAceiteDialogComponent,
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
  public mostrarModalAsignarSucursales: boolean = false;
  public catusuarios: Usuario[] = [];
  public roles: Rol[] = [];
  public usuarioSeleccionado: Usuario | null = null;

  private sucursalNombreMap: Record<string, string> = {};
  private subscripcionUsuarios?: Subscription;
  private subscripcionRoles?: Subscription;
  private subscripcionRelaciones?: Subscription;

  constructor(
    public documentsService: DocumentsService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private branchesService: BranchesService,
    private usuarioSucursalService: UsuarioSucursalService,
  ) { }

  ngOnInit(): void {
    this.usuarioSucursalService.initListener();
    this.obtenerSucursales();
    this.obtenerUsuarios();
    this.obtenerRoles();
    this.subscripcionRelaciones = this.usuarioSucursalService.usuarioSucursal$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscripcionUsuarios?.unsubscribe();
    this.subscripcionRoles?.unsubscribe();
    this.subscripcionRelaciones?.unsubscribe();
  }

  async obtenerSucursales(): Promise<void> {
    this.loading = true;
    try {
      this.sucursales = await this.branchesService.getOnce();
      this.sucursalesSel = this.sucursales.filter(suc => suc.controlDeAceite === true);
      this.sucursalNombreMap = {};
      for (const suc of this.sucursales) {
        if (suc.id !== undefined && suc.id !== null) {
          this.sucursalNombreMap[String(suc.id)] = suc.nombre;
        }
      }
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

  obtenerSucursalesAsignadasIds(usuario: Usuario): string[] {
    if (!usuario?.id) return [];
    return this.usuarioSucursalService.obtenerSucursalesPorUsuario(
      'RECOLECCION_ACEITE',
      String(usuario.id),
      usuario.idArea
    );
  }

  obtenerTooltipSucursales(usuario: Usuario): string {
    const ids = this.obtenerSucursalesAsignadasIds(usuario);
    if (ids.length === 0) return 'Sin sucursales asignadas';
    return ids.map(id => this.sucursalNombreMap[id] || id).join(', ');
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

  abrirModalAsignarSucursales(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalAsignarSucursales = true;
  }

  cerrarModalAsignarSucursales(): void {
    this.mostrarModalAsignarSucursales = false;
    this.usuarioSeleccionado = null;
  }

  onSucursalesAsignadasGuardadas(): void {
    this.showMessage('success', 'Correcto', 'Sucursales asignadas actualizadas correctamente');
    this.cdr.detectChanges();
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
