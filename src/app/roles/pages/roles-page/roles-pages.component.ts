import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RolesService } from '../../services/roles.service';
import { Rol } from '../../interfaces/rol.model';
import {
  GrupoMenuPermiso,
  MenuPermisoItem,
  OpcionRutaInicio,
} from '../../interfaces/ruta.model';
import {
  GRUPOS_MENU_PERMISOS,
  obtenerTodosLosMenusCatalogo,
  obtenerTodosLosPermisosCatalogo,
  RUTAS_INICIO_DISPONIBLES,
} from '../../constants/catalogo-permisos.constants';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-page.component.html',
  styleUrl: './roles-page.component.scss',
})
export default class RolesPageComponent implements OnInit, OnDestroy {
  public catroles: Rol[] = [];
  public loading: boolean = true;
  public guardando: boolean = false;

  // Filtros en UI
  public busquedaRol: string = '';
  public busquedaPermiso: string = '';
  public grupoFiltroId: string = 'TODOS';

  // Estado del editor en el panel derecho
  public modoCreacion: boolean = false;
  public rolSeleccionadoId: string | null = null;

  // Modelo del formulario activo
  public formRol: {
    id: string;
    nombre: string;
    descripcion: string;
    rutaInicio: string;
  } = this.crearFormularioVacio();

  // Set reactivo en memoria para manipular los permisos de menú con O(1)
  public permisosSeleccionados: Set<string> = new Set<string>();

  // Catálogos constantes para la vista
  public readonly gruposCatalogo: GrupoMenuPermiso[] = GRUPOS_MENU_PERMISOS;
  public readonly rutasInicioOpciones: OpcionRutaInicio[] = RUTAS_INICIO_DISPONIBLES;
  public readonly totalMenusSistema: number = obtenerTodosLosMenusCatalogo().length;

  private rolesSub?: Subscription;

  constructor(
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.rolesSub?.unsubscribe();
  }

  private crearFormularioVacio() {
    return {
      id: '',
      nombre: '',
      descripcion: '',
      rutaInicio: '/main/home',
    };
  }

  getRoles(): void {
    this.loading = true;
    this.rolesSub?.unsubscribe();
    this.rolesSub = this.rolesService.get().subscribe({
      next: (data) => {
        this.catroles = data || [];
        this.loading = false;

        if (!this.modoCreacion) {
          if (this.rolSeleccionadoId) {
            const actualizado = this.catroles.find((r) => r.id === this.rolSeleccionadoId);
            if (actualizado) {
              this.cargarRolEnFormulario(actualizado);
            } else if (this.catroles.length > 0) {
              this.seleccionarRol(this.catroles[0]);
            }
          } else if (this.catroles.length > 0) {
            this.seleccionarRol(this.catroles[0]);
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener catálogo de roles:', error);
        this.loading = false;
        this.showMessage('error', 'Error', 'Error al cargar el catálogo de roles');
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Lista de roles filtrada por el buscador lateral
   */
  get rolesFiltrados(): Rol[] {
    const term = this.busquedaRol.trim().toLowerCase();
    if (!term) return this.catroles;
    return this.catroles.filter(
      (r) =>
        (r.nombre || '').toLowerCase().includes(term) ||
        String(r.id).toLowerCase().includes(term) ||
        (r.descripcion || '').toLowerCase().includes(term)
    );
  }

  /**
   * Grupos y menús filtrados por el buscador y el selector de grupo
   */
  get gruposFiltrados(): GrupoMenuPermiso[] {
    const term = this.busquedaPermiso.trim().toLowerCase();

    return this.gruposCatalogo
      .filter((g) => this.grupoFiltroId === 'TODOS' || g.idGrupo === this.grupoFiltroId)
      .map((grupo) => {
        if (!term) return grupo;
        const menusCoincidentes = grupo.menus.filter(
          (m) =>
            m.titulo.toLowerCase().includes(term) ||
            m.ruta.toLowerCase().includes(term) ||
            m.permisoVista.toLowerCase().includes(term)
        );
        return {
          ...grupo,
          menus: menusCoincidentes,
        };
      })
      .filter((g) => g.menus.length > 0);
  }

  /**
   * Selecciona un rol de la lista izquierda para editarlo en el panel derecho
   */
  seleccionarRol(rol: Rol): void {
    this.modoCreacion = false;
    this.rolSeleccionadoId = rol.id;
    this.cargarRolEnFormulario(rol);
    this.cdr.detectChanges();
  }

  /**
   * Inicia la creación de un nuevo rol en el panel derecho (sin permisos preseleccionados)
   */
  iniciarNuevoRol(): void {
    this.modoCreacion = true;
    this.rolSeleccionadoId = null;
    this.formRol = this.crearFormularioVacio();
    this.permisosSeleccionados = new Set<string>();
    this.cdr.detectChanges();
  }

  private cargarRolEnFormulario(rol: Rol): void {
    this.formRol = {
      id: rol.id,
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || '',
      rutaInicio: rol.rutaInicio || '/main/home',
    };
    this.permisosSeleccionados = new Set<string>(rol.permisos || []);
  }

  // =========================================================================
  // Lógica de Selección de Menús
  // =========================================================================

  tienePermiso(key: string): boolean {
    return this.permisosSeleccionados.has(key);
  }

  /**
   * Activa o desactiva el acceso a una opción del menú (.ver).
   */
  toggleMenuVista(menu: MenuPermisoItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.permisosSeleccionados.has(menu.permisoVista)) {
      this.permisosSeleccionados.delete(menu.permisoVista);
    } else {
      this.permisosSeleccionados.add(menu.permisoVista);
    }
    this.cdr.detectChanges();
  }

  /**
   * Activa o desactiva todos los menús de un grupo completo
   */
  toggleGrupoCompleto(grupo: GrupoMenuPermiso): void {
    const todoActivo = this.esGrupoCompletamenteActivo(grupo);
    for (const menu of grupo.menus) {
      if (todoActivo) {
        this.permisosSeleccionados.delete(menu.permisoVista);
      } else {
        this.permisosSeleccionados.add(menu.permisoVista);
      }
    }
    this.cdr.detectChanges();
  }

  esGrupoCompletamenteActivo(grupo: GrupoMenuPermiso): boolean {
    return grupo.menus.every((m) => this.permisosSeleccionados.has(m.permisoVista));
  }

  contarMenusActivosEnGrupo(grupo: GrupoMenuPermiso): number {
    return grupo.menus.filter((m) => this.permisosSeleccionados.has(m.permisoVista)).length;
  }

  /**
   * Acciones masivas sobre todos los menús del rol actual
   */
  seleccionarTodosLosPermisos(): void {
    this.permisosSeleccionados = new Set<string>(obtenerTodosLosPermisosCatalogo());
    this.cdr.detectChanges();
  }

  limpiarTodosLosPermisos(): void {
    this.permisosSeleccionados.clear();
    this.cdr.detectChanges();
  }

  // =========================================================================
  // Contadores de Resumen
  // =========================================================================

  get totalMenusActivosFormulario(): number {
    const todosMenus = obtenerTodosLosMenusCatalogo();
    return todosMenus.filter((m) => this.permisosSeleccionados.has(m.permisoVista)).length;
  }

  contarMenusActivosDeRol(rol: Rol): number {
    const set = new Set(rol.permisos || []);
    return obtenerTodosLosMenusCatalogo().filter((m) => set.has(m.permisoVista)).length;
  }

  // =========================================================================
  // Guardado y Eliminación en Firestore
  // =========================================================================

  async guardarRol(): Promise<void> {
    const nombre = (this.formRol.nombre || '').trim().toUpperCase();
    if (!nombre) {
      this.showMessage('warn', 'Atención', 'Por favor ingresa el nombre del rol');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: Partial<Rol> = {
      nombre,
      descripcion: (this.formRol.descripcion || '').trim(),
      rutaInicio: this.formRol.rutaInicio,
      permisos: Array.from(this.permisosSeleccionados),
    };

    try {
      if (!this.modoCreacion && this.formRol.id) {
        await this.rolesService.update(payload, this.formRol.id);
        this.showMessage(
          'success',
          'Rol actualizado',
          `Los permisos de "${nombre}" se guardaron en Firebase correctamente.`
        );
      } else {
        const nuevoId = await this.rolesService.create(payload);
        this.modoCreacion = false;
        this.rolSeleccionadoId = nuevoId;
        this.formRol.id = nuevoId;
        this.showMessage(
          'success',
          'Rol creado',
          `El rol "${nombre}" (#${nuevoId}) se creó en Firebase correctamente.`
        );
      }
    } catch (error) {
      console.error('Error al guardar rol:', error);
      this.showMessage('error', 'Error', 'Ocurrió un error al guardar el rol en Firestore');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  confirmarEliminarRol(rolId: string, nombreRol: string): void {
    this.confirmationService.confirm({
      header: 'Eliminar Rol',
      message: `¿Está seguro que desea eliminar el rol "${nombreRol}" (#${rolId})?`,
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.deleteRol(rolId);
      },
    });
  }

  async deleteRol(id: string | number): Promise<void> {
    try {
      await this.rolesService.delete(id);
      if (this.rolSeleccionadoId === String(id)) {
        this.rolSeleccionadoId = null;
      }
      this.showMessage('success', 'Éxito', 'Rol eliminado correctamente');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      this.showMessage('error', 'Error', 'Error al eliminar el rol');
    }
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
