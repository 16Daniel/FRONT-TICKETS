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
import { DialogModule } from 'primeng/dialog';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AreasService } from '../../../areas/services/areas.service';
import { Area } from '../../../areas/models/area.model';
import { RolesService } from '../../services/roles.service';
import { ModoReglaArea, ReglaAreaPermiso, Rol } from '../../models/rol.model';
import { GrupoMenuPermiso } from '../../interfaces/grupo-menu-permiso.interface';
import { MenuPermisoItem } from '../../interfaces/menu-permiso-item.interface';
import { OpcionRutaInicio } from '../../interfaces/opcion-ruta-inicio.interface';
import {
  evaluarPermisoParaArea,
  GRUPOS_MENU_PERMISOS,
  normalizarIdArea,
  normalizarRutaInicio,
  obtenerTodosLosMenusCatalogo,
  obtenerTodosLosPermisosCatalogo,
  RUTA_INICIO_DEFECTO,
  RUTAS_INICIO_DISPONIBLES,
  sanearReglasAreaPorPermiso,
} from '../../constants/catalogo-permisos.constants';

interface OpcionSimuladorArea {
  label: string;
  value: string | null;
}

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
    DialogModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-page.component.html',
  styleUrl: './roles-page.component.scss',
})
export default class RolesPageComponent implements OnInit, OnDestroy {
  public catroles: Rol[] = [];
  public areasCatalogo: Area[] = [];
  public loading: boolean = true;
  public guardando: boolean = false;

  // Filtros en UI
  public busquedaRol: string = '';
  public busquedaPermiso: string = '';
  public grupoFiltroId: string = 'TODOS';
  public soloConReglaArea: boolean = false;
  public areaSimuladaId: string | null = null;

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
  // Mapa reactivo en memoria para las reglas de alcance por área
  public reglasAreaSeleccionadas: Map<string, ReglaAreaPermiso> = new Map<string, ReglaAreaPermiso>();

  // Estado del modal de configuración de regla por área
  public modalReglaVisible: boolean = false;
  public modalReglaTipo: 'menu' | 'grupo' = 'menu';
  public modalMenuObjetivo: MenuPermisoItem | null = null;
  public modalGrupoObjetivo: GrupoMenuPermiso | null = null;
  public modalModo: ModoReglaArea = 'SOLO_AREAS';
  public modalAreasSeleccionadas: Set<string> = new Set<string>();
  public modalBusquedaArea: string = '';

  // Catálogos constantes para la vista
  public readonly gruposCatalogo: GrupoMenuPermiso[] = GRUPOS_MENU_PERMISOS;
  public readonly rutasInicioOpciones: OpcionRutaInicio[] = RUTAS_INICIO_DISPONIBLES;
  private readonly todosLosMenus: MenuPermisoItem[] = obtenerTodosLosMenusCatalogo();
  public readonly totalMenusSistema: number = this.todosLosMenus.length;

  public opcionesSimuladorArea: OpcionSimuladorArea[] = [
    { label: 'Modo edición (todas las áreas)', value: null },
  ];

  private areasMap: Map<string, Area> = new Map<string, Area>();
  private rolesSub?: Subscription;
  private areasSub?: Subscription;

  constructor(
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private rolesService: RolesService,
    private areasService: AreasService
  ) {}

  ngOnInit(): void {
    this.cargarAreas();
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.rolesSub?.unsubscribe();
    this.areasSub?.unsubscribe();
  }

  private crearFormularioVacio() {
    return {
      id: '',
      nombre: '',
      descripcion: '',
      rutaInicio: RUTA_INICIO_DEFECTO,
    };
  }

  private cargarAreas(): void {
    this.areasSub?.unsubscribe();
    this.areasSub = this.areasService.areas$.subscribe((areas) => {
      const ordenadas = [...(areas || [])].sort((a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
      );
      this.areasCatalogo = ordenadas;
      this.areasMap = new Map(ordenadas.map((a) => [normalizarIdArea(a.id), a]));
      this.opcionesSimuladorArea = [
        { label: 'Modo edición (todas las áreas)', value: null },
        ...ordenadas.map((a) => ({
          label: `Simular área: ${a.nombre}`,
          value: normalizarIdArea(a.id),
        })),
      ];

      if (this.areaSimuladaId && !this.areasMap.has(this.areaSimuladaId)) {
        this.areaSimuladaId = null;
      }

      this.cdr.detectChanges();
    });
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
   * Grupos y menús filtrados por el buscador, selector de grupo y filtro de reglas de área
   */
  get gruposFiltrados(): GrupoMenuPermiso[] {
    const term = this.busquedaPermiso.trim().toLowerCase();

    return this.gruposCatalogo
      .filter((g) => this.grupoFiltroId === 'TODOS' || g.idGrupo === this.grupoFiltroId)
      .map((grupo) => {
        const menusCoincidentes = grupo.menus.filter((m) => {
          const coincideTexto =
            !term ||
            m.titulo.toLowerCase().includes(term) ||
            m.ruta.toLowerCase().includes(term) ||
            m.permisoVista.toLowerCase().includes(term) ||
            this.obtenerNombresAreasRegla(m.permisoVista).some((n) =>
              n.toLowerCase().includes(term)
            );

          const coincideFiltroRegla =
            !this.soloConReglaArea || this.tieneReglaArea(m.permisoVista);

          return coincideTexto && coincideFiltroRegla;
        });

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
    this.reglasAreaSeleccionadas = new Map<string, ReglaAreaPermiso>();
    this.areaSimuladaId = null;
    this.soloConReglaArea = false;
    this.cdr.detectChanges();
  }

  private cargarRolEnFormulario(rol: Rol): void {
    this.formRol = {
      id: rol.id,
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || '',
      rutaInicio: normalizarRutaInicio(rol.rutaInicio),
    };
    this.permisosSeleccionados = new Set<string>(rol.permisos || []);

    const reglasLimpias = sanearReglasAreaPorPermiso(
      rol.reglasAreaPorPermiso,
      this.permisosSeleccionados
    );
    this.reglasAreaSeleccionadas = new Map<string, ReglaAreaPermiso>(
      Object.entries(reglasLimpias).map(([permiso, regla]) => [
        permiso,
        { modo: regla.modo, areasIds: [...regla.areasIds] },
      ])
    );
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
      this.reglasAreaSeleccionadas.delete(menu.permisoVista);
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
        this.reglasAreaSeleccionadas.delete(menu.permisoVista);
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

  contarReglasAreaEnGrupo(grupo: GrupoMenuPermiso): number {
    return grupo.menus.filter((m) => this.tieneReglaArea(m.permisoVista)).length;
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
    this.reglasAreaSeleccionadas.clear();
    this.soloConReglaArea = false;
    this.cdr.detectChanges();
  }

  // =========================================================================
  // Lógica de Reglas por Área y Simulador
  // =========================================================================

  tieneReglaArea(permiso: string): boolean {
    return this.permisosSeleccionados.has(permiso) && this.reglasAreaSeleccionadas.has(permiso);
  }

  obtenerReglaArea(permiso: string): ReglaAreaPermiso | null {
    if (!this.permisosSeleccionados.has(permiso)) return null;
    return this.reglasAreaSeleccionadas.get(permiso) || null;
  }

  obtenerNombreArea(idArea: string): string {
    const area = this.areasMap.get(normalizarIdArea(idArea));
    return area?.nombre || `Área #${idArea} (inactiva)`;
  }

  esAreaInactiva(idArea: string): boolean {
    return !this.areasMap.has(normalizarIdArea(idArea));
  }

  obtenerNombresAreasRegla(permiso: string): string[] {
    const regla = this.obtenerReglaArea(permiso);
    if (!regla) return [];
    return regla.areasIds.map((id) => this.obtenerNombreArea(id));
  }

  obtenerReglasComoObjeto(): Record<string, ReglaAreaPermiso> {
    const obj: Record<string, ReglaAreaPermiso> = {};
    this.reglasAreaSeleccionadas.forEach((regla, permiso) => {
      if (this.permisosSeleccionados.has(permiso) && regla.areasIds.length > 0) {
        obj[permiso] = {
          modo: regla.modo,
          areasIds: [...regla.areasIds],
        };
      }
    });
    return obj;
  }

  esMenuVisibleEnAreaSimulada(menu: MenuPermisoItem): boolean {
    if (!this.areaSimuladaId) {
      return this.tienePermiso(menu.permisoVista);
    }
    return evaluarPermisoParaArea(
      menu.permisoVista,
      this.permisosSeleccionados,
      this.obtenerReglasComoObjeto(),
      this.areaSimuladaId
    );
  }

  esMenuRestringidoEnAreaSimulada(menu: MenuPermisoItem): boolean {
    return (
      !!this.areaSimuladaId &&
      this.tienePermiso(menu.permisoVista) &&
      !this.esMenuVisibleEnAreaSimulada(menu)
    );
  }

  get nombreAreaSimulada(): string {
    return this.areaSimuladaId ? this.obtenerNombreArea(this.areaSimuladaId) : '';
  }

  get rutaInicioTieneRestriccionArea(): boolean {
    const menuInicio = this.todosLosMenus.find((m) => m.ruta === this.formRol.rutaInicio);
    return menuInicio ? this.tieneReglaArea(menuInicio.permisoVista) : false;
  }

  quitarReglaMenu(menu: MenuPermisoItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.reglasAreaSeleccionadas.delete(menu.permisoVista);
    if (this.totalReglasAreaFormulario === 0) {
      this.soloConReglaArea = false;
    }
    this.cdr.detectChanges();
  }

  // =========================================================================
  // Modal de Configuración de Regla por Área (Menú individual o Grupo)
  // =========================================================================

  abrirModalReglaMenu(menu: MenuPermisoItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.permisosSeleccionados.has(menu.permisoVista)) {
      this.permisosSeleccionados.add(menu.permisoVista);
    }

    this.modalReglaTipo = 'menu';
    this.modalMenuObjetivo = menu;
    this.modalGrupoObjetivo = null;
    this.modalBusquedaArea = '';

    const reglaActual = this.reglasAreaSeleccionadas.get(menu.permisoVista);
    if (reglaActual) {
      this.modalModo = reglaActual.modo;
      this.modalAreasSeleccionadas = new Set<string>(reglaActual.areasIds);
    } else {
      this.modalModo = 'SOLO_AREAS';
      this.modalAreasSeleccionadas = new Set<string>();
    }

    this.modalReglaVisible = true;
    this.cdr.detectChanges();
  }

  abrirModalReglaGrupo(grupo: GrupoMenuPermiso): void {
    const menusActivos = grupo.menus.filter((m) => this.permisosSeleccionados.has(m.permisoVista));
    if (menusActivos.length === 0) {
      this.showMessage(
        'info',
        'Sin menús activos',
        `Activa al menos una opción del grupo "${grupo.tituloGrupo}" para configurar su alcance por área.`
      );
      return;
    }

    this.modalReglaTipo = 'grupo';
    this.modalGrupoObjetivo = grupo;
    this.modalMenuObjetivo = null;
    this.modalBusquedaArea = '';

    // Si algún menú activo del grupo ya tiene regla, pre-cargar la primera como referencia
    const primeraRegla = menusActivos
      .map((m) => this.reglasAreaSeleccionadas.get(m.permisoVista))
      .find((r) => !!r);

    if (primeraRegla) {
      this.modalModo = primeraRegla.modo;
      this.modalAreasSeleccionadas = new Set<string>(primeraRegla.areasIds);
    } else {
      this.modalModo = 'SOLO_AREAS';
      this.modalAreasSeleccionadas = new Set<string>();
    }

    this.modalReglaVisible = true;
    this.cdr.detectChanges();
  }

  get modalAreasFiltradas(): { id: string; nombre: string; inactiva: boolean }[] {
    const term = this.modalBusquedaArea.trim().toLowerCase();
    const lista: { id: string; nombre: string; inactiva: boolean }[] = this.areasCatalogo.map(
      (a) => ({
        id: normalizarIdArea(a.id),
        nombre: a.nombre || `Área #${a.id}`,
        inactiva: false,
      })
    );

    // Mostrar también IDs huérfanos que hayan quedado guardados en la regla para poder desmarcarlos
    this.modalAreasSeleccionadas.forEach((id) => {
      if (!this.areasMap.has(id)) {
        lista.push({
          id,
          nombre: `Área #${id} (inactiva)`,
          inactiva: true,
        });
      }
    });

    if (!term) return lista;
    return lista.filter(
      (item) => item.nombre.toLowerCase().includes(term) || item.id.toLowerCase().includes(term)
    );
  }

  get modalTieneReglaPrevia(): boolean {
    if (this.modalReglaTipo === 'menu' && this.modalMenuObjetivo) {
      return this.tieneReglaArea(this.modalMenuObjetivo.permisoVista);
    }
    if (this.modalReglaTipo === 'grupo' && this.modalGrupoObjetivo) {
      return this.contarReglasAreaEnGrupo(this.modalGrupoObjetivo) > 0;
    }
    return false;
  }

  get modalPuedeAplicar(): boolean {
    if (this.modalModo === 'TODAS') return true;
    return this.modalAreasSeleccionadas.size > 0;
  }

  get modalTituloObjetivo(): string {
    if (this.modalReglaTipo === 'menu' && this.modalMenuObjetivo) {
      return this.modalMenuObjetivo.titulo;
    }
    if (this.modalReglaTipo === 'grupo' && this.modalGrupoObjetivo) {
      const activos = this.contarMenusActivosEnGrupo(this.modalGrupoObjetivo);
      return `Grupo ${this.modalGrupoObjetivo.tituloGrupo} (${activos} menús activos)`;
    }
    return '';
  }

  get modalResumenTexto(): string {
    const rolNombre = (this.formRol.nombre || 'ESTE ROL').trim().toUpperCase();
    const objetivo =
      this.modalReglaTipo === 'menu' && this.modalMenuObjetivo
        ? `la pantalla "${this.modalMenuObjetivo.titulo}"`
        : `los menús activos del grupo "${this.modalGrupoObjetivo?.tituloGrupo || ''}"`;

    if (this.modalModo === 'TODAS') {
      return `Todos los usuarios con rol ${rolNombre} podrán ver ${objetivo}, sin importar su área.`;
    }

    if (this.modalAreasSeleccionadas.size === 0) {
      return 'Selecciona al menos un área para definir esta regla.';
    }

    const nombres = Array.from(this.modalAreasSeleccionadas).map((id) =>
      this.obtenerNombreArea(id)
    );
    const listaTexto =
      nombres.length <= 3
        ? nombres.join(', ')
        : `${nombres.slice(0, 3).join(', ')} y ${nombres.length - 3} más`;

    if (this.modalModo === 'SOLO_AREAS') {
      return `Los usuarios con rol ${rolNombre} verán ${objetivo} únicamente si pertenecen a: ${listaTexto}.`;
    }

    return `Todos los usuarios con rol ${rolNombre} verán ${objetivo}, excepto quienes pertenezcan a: ${listaTexto}.`;
  }

  toggleAreaEnModal(idArea: string): void {
    if (this.modalAreasSeleccionadas.has(idArea)) {
      this.modalAreasSeleccionadas.delete(idArea);
    } else {
      this.modalAreasSeleccionadas.add(idArea);
    }
    this.cdr.detectChanges();
  }

  seleccionarTodasAreasModal(): void {
    for (const area of this.areasCatalogo) {
      const id = normalizarIdArea(area.id);
      if (id) this.modalAreasSeleccionadas.add(id);
    }
    this.cdr.detectChanges();
  }

  limpiarAreasModal(): void {
    this.modalAreasSeleccionadas.clear();
    this.cdr.detectChanges();
  }

  restablecerReglaATodasEnModal(): void {
    this.modalModo = 'TODAS';
    this.aplicarReglaModal();
  }

  aplicarReglaModal(): void {
    if (!this.modalPuedeAplicar) return;

    const permisosObjetivo: string[] = [];
    if (this.modalReglaTipo === 'menu' && this.modalMenuObjetivo) {
      permisosObjetivo.push(this.modalMenuObjetivo.permisoVista);
    } else if (this.modalReglaTipo === 'grupo' && this.modalGrupoObjetivo) {
      for (const menu of this.modalGrupoObjetivo.menus) {
        if (this.permisosSeleccionados.has(menu.permisoVista)) {
          permisosObjetivo.push(menu.permisoVista);
        }
      }
    }

    const areasIds = Array.from(this.modalAreasSeleccionadas);
    for (const permiso of permisosObjetivo) {
      if (this.modalModo === 'TODAS' || areasIds.length === 0) {
        this.reglasAreaSeleccionadas.delete(permiso);
      } else {
        this.reglasAreaSeleccionadas.set(permiso, {
          modo: this.modalModo,
          areasIds: [...areasIds],
        });
      }
    }

    if (this.totalReglasAreaFormulario === 0) {
      this.soloConReglaArea = false;
    }

    this.modalReglaVisible = false;
    this.cdr.detectChanges();
  }

  // =========================================================================
  // Contadores de Resumen
  // =========================================================================

  get totalMenusActivosFormulario(): number {
    return this.todosLosMenus.filter((m) => this.permisosSeleccionados.has(m.permisoVista)).length;
  }

  get totalReglasAreaFormulario(): number {
    return this.todosLosMenus.filter((m) => this.tieneReglaArea(m.permisoVista)).length;
  }

  get totalMenusVisiblesAreaSimulada(): number {
    if (!this.areaSimuladaId) return this.totalMenusActivosFormulario;
    return this.todosLosMenus.filter((m) => this.esMenuVisibleEnAreaSimulada(m)).length;
  }

  contarMenusActivosDeRol(rol: Rol): number {
    const set = new Set(rol.permisos || []);
    return this.todosLosMenus.filter((m) => set.has(m.permisoVista)).length;
  }

  contarReglasAreaDeRol(rol: Rol): number {
    if (!rol.reglasAreaPorPermiso) return 0;
    const set = new Set(rol.permisos || []);
    return Object.entries(rol.reglasAreaPorPermiso).filter(
      ([permiso, regla]) => set.has(permiso) && regla?.areasIds?.length > 0
    ).length;
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
      reglasAreaPorPermiso: this.obtenerReglasComoObjeto(),
    };

    try {
      if (!this.modoCreacion && this.formRol.id) {
        await this.rolesService.update(payload, this.formRol.id);
        this.showMessage(
          'success',
          'Rol actualizado',
          `Los permisos y reglas por área de "${nombre}" se guardaron en Firebase correctamente.`
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
