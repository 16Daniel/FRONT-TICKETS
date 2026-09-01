import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';

import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria, generateGUID } from '../../interfaces/subcategoria.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { CategoriesService } from '../../services/categories.service';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../interfaces/ticket.model';
import { CuadranteInfo } from '../../interfaces/cuadrante-info.interface';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    InputTextModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.scss'
})
export default class CategoriesPageComponent implements OnInit, OnDestroy {
  readonly String = String;
  usuario: Usuario;
  areas: Area[] = [];
  areaSeleccionadaId: string = '1';
  categorias: Categoria[] = [];
  tickets: Ticket[] = [];
  filtroTexto: string = '';

  mostrarGuiaMatriz: boolean = false;
  expandedNodeIds = new Set<string>();

  openAddFormFor: string | null = null; // null | 'ROOT' | string (parent category ID)
  openEditFormFor: string | null = null; // null | string (node ID)

  addForm = {
    nombre: '',
    tipo: 'rama' as 'rama' | 'hoja',
    impacto: 2,
    urgencia: 2
  };

  editForm = {
    nombre: '',
    tipo: 'rama' as 'rama' | 'hoja',
    impacto: 2,
    urgencia: 2
  };

  readonly MATRIZ_FILAS = [
    { impacto: 3, label: '3 · Crítico' },
    { impacto: 2, label: '2 · Moderado' },
    { impacto: 1, label: '1 · Leve' }
  ];

  readonly MATRIZ_COLUMNAS = [
    { urgencia: 1, label: '1 · Baja' },
    { urgencia: 2, label: '2 · Media' },
    { urgencia: 3, label: '3 · Inmediata' }
  ];

  readonly CUADRANTES: CuadranteInfo[] = [
    { key: 'critico', min: 7, max: 9, label: 'Crítico', fill: '#EF4444', bg: '#FFF1F2', text: '#E11D48', icon: 'bx-flame', desc: 'Impacto alto + urgencia alta. Detiene la operación o genera riesgo crítico.', slaMin: 2, slaMax: 36 },
    { key: 'alto', min: 5, max: 6, label: 'Alto', fill: '#F59E0B', bg: '#FFFBEB', text: '#D97706', icon: 'bx-error-alt', desc: 'Afecta un proceso o equipo clave sin detener toda la sucursal.', slaMin: 8, slaMax: 72 },
    { key: 'medio', min: 3, max: 4, label: 'Medio', fill: '#EAB308', bg: '#FEFCE8', text: '#CA8A04', icon: 'bx-time-five', desc: 'Molesta pero se puede rodear. Entra a la fila de atención normal.', slaMin: 24, slaMax: 96 },
    { key: 'bajo', min: 1, max: 2, label: 'Bajo', fill: '#10B981', bg: '#F0FDF4', text: '#059669', icon: 'bx-check-circle', desc: 'Cosmético o de mejora continua. No afecta la operación diaria.', slaMin: 72, slaMax: 120 }
  ];

  readonly CELL_SLA: { [key: string]: { res: number; resp: number } } = {
    '1-1': { res: 120, resp: 24 },
    '2-1': { res: 72, resp: 12 },
    '3-1': { res: 36, resp: 6 },
    '1-2': { res: 96, resp: 16 },
    '2-2': { res: 24, resp: 4 },
    '3-2': { res: 8, resp: 0.5 },
    '1-3': { res: 48, resp: 8 },
    '2-3': { res: 12, resp: 1 },
    '3-3': { res: 2, resp: 0.25 }
  };

  private subscripcionCategorias?: Subscription;
  private subscripcionTickets?: Subscription;
  private subscripcionAreas?: Subscription;

  constructor(
    private confirmationService: ConfirmationService,
    private categoriesService: CategoriesService,
    private ticketsService: TicketsService,
    private areasService: AreasService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk') || '{}');
    if (this.usuario && this.usuario.idArea) {
      this.areaSeleccionadaId = String(this.usuario.idArea);
    }
  }

  ngOnInit(): void {
    this.cargarAreas();
    this.cargarCategorias();
    this.cargarTickets();
  }

  ngOnDestroy(): void {
    if (this.subscripcionCategorias) this.subscripcionCategorias.unsubscribe();
    if (this.subscripcionTickets) this.subscripcionTickets.unsubscribe();
    if (this.subscripcionAreas) this.subscripcionAreas.unsubscribe();
  }

  cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas) => {
      if (areas && areas.length > 0) {
        this.areas = areas;
      } else {
        this.areas = [
          { id: '1', nombre: 'Sistemas', eliminado: false },
          { id: '2', nombre: 'Compras', eliminado: false },
          { id: '3', nombre: 'Mantenimiento', eliminado: false },
          { id: '4', nombre: 'Audio y Video', eliminado: false }
        ];
      }
      this.cdr.detectChanges();
    });
  }

  seleccionarArea(areaId: string): void {
    this.areaSeleccionadaId = String(areaId);
    this.openAddFormFor = null;
    this.openEditFormFor = null;
    this.cargarCategorias();
    this.cargarTickets();
  }

  get areaActual(): Area | undefined {
    return this.areas.find((a) => String(a.id) === String(this.areaSeleccionadaId));
  }

  cargarCategorias(): void {
    if (this.subscripcionCategorias) {
      this.subscripcionCategorias.unsubscribe();
    }

    this.subscripcionCategorias = this.categoriesService.get(this.areaSeleccionadaId).subscribe(
      (result) => {
        this.categorias = (result || []).map((cat) => {
          this.normalizarNodo(cat);
          return cat;
        });

        // Expandir por defecto las categorías raíz
        this.categorias.forEach((c) => this.expandedNodeIds.add(String(c.id)));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud de categorías');
      }
    );
  }

  private normalizarNodo(nodo: Categoria | Subcategoria): void {
    if (!nodo.subcategorias) {
      nodo.subcategorias = [];
    }
    const tieneHijos = nodo.subcategorias.some((s) => !s.eliminado);
    if (!nodo.tipo) {
      nodo.tipo = tieneHijos || (nodo as any).activarSubcategorias ? 'rama' : 'hoja';
    }
    if (nodo.tipo === 'hoja' && !nodo.score) {
      nodo.urgencia = 2;
      nodo.score = 4;
      nodo.prioridad = this.clasificarCuadrante(4).label;
    }
    delete (nodo as any).estimacion;
    delete (nodo as any).slaRes;
    delete (nodo as any).slaResp;
    delete (nodo as any).impacto;
    for (const hijo of nodo.subcategorias) {
      this.normalizarNodo(hijo);
    }
  }

  cargarTickets(): void {
    if (this.subscripcionTickets) {
      this.subscripcionTickets.unsubscribe();
    }
    this.subscripcionTickets = this.ticketsService.get(this.areaSeleccionadaId).subscribe(
      (result) => {
        this.tickets = result || [];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener tickets:', error);
      }
    );
  }

  /* Búsqueda recursiva de cualquier nodo, su padre y su raíz */
  buscarInfoNodo(nodoId: string): { nodo: Categoria | Subcategoria; parent: Categoria | Subcategoria | null; rootCat: Categoria } | null {
    for (const cat of this.categorias) {
      if (String(cat.id) === String(nodoId)) {
        return { nodo: cat, parent: null, rootCat: cat };
      }

      const buscarEnHijos = (
        hijos: Subcategoria[],
        padreActual: Categoria | Subcategoria,
        raiz: Categoria
      ): { nodo: Categoria | Subcategoria; parent: Categoria | Subcategoria | null; rootCat: Categoria } | null => {
        for (const h of hijos) {
          if (String(h.id) === String(nodoId)) {
            return { nodo: h, parent: padreActual, rootCat: raiz };
          }
          if (h.subcategorias && h.subcategorias.length > 0) {
            const encontrado = buscarEnHijos(h.subcategorias, h, raiz);
            if (encontrado) return encontrado;
          }
        }
        return null;
      };

      if (cat.subcategorias && cat.subcategorias.length > 0) {
        const res = buscarEnHijos(cat.subcategorias, cat, cat);
        if (res) return res;
      }
    }
    return null;
  }

  coincideFiltro(nodo: Categoria | Subcategoria): boolean {
    if (!this.filtroTexto || !this.filtroTexto.trim()) return true;
    const busqueda = this.filtroTexto.toLowerCase().trim();
    const verificar = (n: Categoria | Subcategoria): boolean => {
      if (n.nombre.toLowerCase().includes(busqueda)) return true;
      if (n.subcategorias) {
        return n.subcategorias.some((s) => !s.eliminado && verificar(s));
      }
      return false;
    };
    return verificar(nodo);
  }

  /* Conteo y estadísticas recursivas */
  get totalCategorias(): number {
    const contarNodo = (n: Categoria | Subcategoria): number => {
      let cuenta = 1;
      if (n.subcategorias) {
        for (const h of n.subcategorias) {
          if (!h.eliminado) cuenta += contarNodo(h);
        }
      }
      return cuenta;
    };
    let total = 0;
    for (const cat of this.categorias) {
      total += contarNodo(cat);
    }
    return total;
  }

  get totalCategoriasFinales(): number {
    const contarHojas = (n: Categoria | Subcategoria): number => {
      const hijos = this.obtenerHijosActivos(n);
      if (n.tipo === 'hoja' || hijos.length === 0) {
        return 1;
      }
      let cuenta = 0;
      for (const h of hijos) {
        cuenta += contarHojas(h);
      }
      return cuenta;
    };
    let total = 0;
    for (const cat of this.categorias) {
      total += contarHojas(cat);
    }
    return total;
  }

  get totalTicketsActivos(): number {
    return this.tickets.length;
  }

  obtenerConteoTickets(nodo: Categoria | Subcategoria, rootCat?: Categoria): number {
    const actualRoot = rootCat || (nodo as Categoria);
    const rootId = String(actualRoot.id);
    const nodoId = String(nodo.id);

    const recolectarIds = (n: Categoria | Subcategoria): string[] => {
      let ids = [String(n.id)];
      if (n.subcategorias) {
        for (const h of n.subcategorias) {
          if (!h.eliminado) {
            ids = ids.concat(recolectarIds(h));
          }
        }
      }
      return ids;
    };

    const todosLosIds = recolectarIds(nodo);

    return this.tickets.filter((t) => {
      if (String(t.idCategoria) !== rootId) return false;
      if (nodoId === rootId && (!t.idSubcategoria || t.idSubcategoria === 'null' || t.idSubcategoria === '')) {
        return true;
      }
      return t.idSubcategoria && todosLosIds.includes(String(t.idSubcategoria));
    }).length;
  }

  obtenerHijosActivos(nodo: Categoria | Subcategoria): Subcategoria[] {
    if (!nodo || !nodo.subcategorias) return [];
    return nodo.subcategorias.filter((s) => !s.eliminado);
  }

  esRama(nodo: Categoria | Subcategoria): boolean {
    return nodo.tipo === 'rama' || this.obtenerHijosActivos(nodo).length > 0;
  }

  /* Helpers de Matriz 3x3 */
  calcularScore(impacto: number, urgencia: number): number {
    return (impacto || 1) * (urgencia || 1);
  }

  obtenerSLA(impacto: number, urgencia: number): { res: number; resp: number } {
    const key = `${impacto}-${urgencia}`;
    return this.CELL_SLA[key] || { res: 24, resp: 4 };
  }

  clasificarCuadrante(score: number): CuadranteInfo {
    for (const q of this.CUADRANTES) {
      if (score >= q.min && score <= q.max) return q;
    }
    return this.CUADRANTES[3];
  }

  formatearHoras(horas: number | undefined): string {
    if (horas === undefined || horas === null) return 'N/A';
    if (horas < 1) return `${Math.round(horas * 60)} min`;
    if (horas < 24) return `${horas % 1 === 0 ? horas : horas.toFixed(1)} hrs`;
    const dias = horas / 24;
    return `${dias % 1 === 0 ? dias : dias.toFixed(1)} d (${horas}h)`;
  }

  /* Control de Expansión de Nodos */
  toggleNode(id: string): void {
    if (this.expandedNodeIds.has(String(id))) {
      this.expandedNodeIds.delete(String(id));
    } else {
      this.expandedNodeIds.add(String(id));
    }
  }

  isExpanded(id: string): boolean {
    return this.expandedNodeIds.has(String(id));
  }

  toggleExpandAll(): void {
    const recolectarRamas = (n: Categoria | Subcategoria, acc: string[]): void => {
      if (this.esRama(n)) {
        acc.push(String(n.id));
      }
      if (n.subcategorias) {
        for (const h of n.subcategorias) {
          if (!h.eliminado) recolectarRamas(h, acc);
        }
      }
    };

    const todasLasRamas: string[] = [];
    this.categorias.forEach((c) => recolectarRamas(c, todasLasRamas));

    const allAreExpanded = todasLasRamas.length > 0 && todasLasRamas.every((id) => this.expandedNodeIds.has(id));

    if (allAreExpanded) {
      this.expandedNodeIds.clear();
    } else {
      todasLasRamas.forEach((id) => this.expandedNodeIds.add(id));
    }
  }

  get allExpanded(): boolean {
    const recolectarRamas = (n: Categoria | Subcategoria, acc: string[]): void => {
      if (this.esRama(n)) {
        acc.push(String(n.id));
      }
      if (n.subcategorias) {
        for (const h of n.subcategorias) {
          if (!h.eliminado) recolectarRamas(h, acc);
        }
      }
    };

    const todasLasRamas: string[] = [];
    this.categorias.forEach((c) => recolectarRamas(c, todasLasRamas));

    return todasLasRamas.length > 0 && todasLasRamas.every((id) => this.expandedNodeIds.has(id));
  }

  /* Formulario In-line: Creación y Edición */
  abrirFormularioCrearRaiz(): void {
    this.openEditFormFor = null;
    this.openAddFormFor = this.openAddFormFor === 'ROOT' ? null : 'ROOT';
    this.addForm = {
      nombre: '',
      tipo: 'rama',
      impacto: 2,
      urgencia: 2
    };
  }

  abrirFormularioAgregarHijo(nodo: Categoria | Subcategoria): void {
    this.openEditFormFor = null;
    this.openAddFormFor = this.openAddFormFor == nodo.id ? null : String(nodo.id);
    this.addForm = {
      nombre: '',
      tipo: 'hoja',
      impacto: 2,
      urgencia: 2
    };
    this.expandedNodeIds.add(String(nodo.id));
  }

  abrirFormularioEditar(nodo: Categoria | Subcategoria): void {
    this.openAddFormFor = null;
    this.openEditFormFor = this.openEditFormFor == nodo.id ? null : String(nodo.id);
    const isLeaf = nodo.tipo === 'hoja' || this.obtenerHijosActivos(nodo).length === 0;

    this.editForm = {
      nombre: nodo.nombre,
      tipo: isLeaf ? 'hoja' : 'rama',
      impacto: (nodo as any).impacto || 2,
      urgencia: (nodo as any).urgencia || 2
    };
  }

  cancelarFormulario(): void {
    this.openAddFormFor = null;
    this.openEditFormFor = null;
  }

  seleccionarCeldaMatriz(formTarget: 'add' | 'edit', impacto: number, urgencia: number): void {
    if (formTarget === 'add') {
      this.addForm.impacto = impacto;
      this.addForm.urgencia = urgencia;
    } else {
      this.editForm.impacto = impacto;
      this.editForm.urgencia = urgencia;
    }
  }

  async guardarNuevoNodo(parentId: string | null): Promise<void> {
    const nombre = this.addForm.nombre.trim();
    if (!nombre) {
      this.showMessage('error', 'Validación', 'El nombre es obligatorio.');
      return;
    }

    const isLeaf = this.addForm.tipo === 'hoja';
    const impacto = isLeaf ? this.addForm.impacto : undefined;
    const urgencia = isLeaf ? this.addForm.urgencia : undefined;
    const score = isLeaf && impacto && urgencia ? this.calcularScore(impacto, urgencia) : undefined;
    const sla = isLeaf && impacto && urgencia ? this.obtenerSLA(impacto, urgencia) : undefined;
    const cuadrante = score ? this.clasificarCuadrante(score) : undefined;

    try {
      if (parentId === null) {
        // Crear Categoría Raíz
        const nuevoSecuencial = await this.categoriesService.obtenerSecuencial();
        const nuevaCategoria: Categoria = {
          id: nuevoSecuencial,
          idArea: parseInt(this.areaSeleccionadaId, 10),
          nombre: nombre,
          eliminado: false,
          subcategorias: [],
          activarSubcategorias: !isLeaf,
          tipo: this.addForm.tipo,
          urgencia: urgencia,
          criticidad: score,
          score: score,
          prioridad: cuadrante ? cuadrante.label : undefined
        };

        await this.categoriesService.create(nuevaCategoria);
        this.showMessage('success', 'Éxito', `Categoría "${nombre}" creada correctamente.`);
      } else {
        // Agregar Subcategoría dentro de cualquier nodo
        const info = this.buscarInfoNodo(parentId);
        if (!info) {
          this.showMessage('error', 'Error', 'No se encontró el nodo padre.');
          return;
        }

        if (!info.nodo.subcategorias) {
          info.nodo.subcategorias = [];
        }

        const nuevaSub: Subcategoria = {
          id: generateGUID(),
          nombre: nombre,
          eliminado: false,
          tipo: this.addForm.tipo,
          subcategorias: [],
          activarSubcategorias: !isLeaf,
          ...(isLeaf ? {
            urgencia: urgencia,
            criticidad: score,
            score: score,
            prioridad: cuadrante ? cuadrante.label : undefined
          } : {})
        };

        info.nodo.subcategorias.push(nuevaSub);
        info.nodo.tipo = 'rama'; // Se convierte en rama al tener hijos
        info.nodo.activarSubcategorias = true;

        console.log('[categories-page] Payload completo a guardar en Firestore:', JSON.stringify(info.rootCat, null, 2));
        await this.categoriesService.update(info.rootCat, String(info.rootCat.id));
        this.showMessage('success', 'Éxito', `Subcategoría "${nombre}" agregada a "${info.nodo.nombre}".`);
        this.expandedNodeIds.add(String(info.nodo.id));
      }

      this.openAddFormFor = null;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
      this.showMessage('error', 'Error', error.message || 'Error al guardar');
    }
  }

  async guardarEdicionNodo(nodoId: string): Promise<void> {
    const nombre = this.editForm.nombre.trim();
    if (!nombre) {
      this.showMessage('error', 'Validación', 'El nombre no puede estar vacío.');
      return;
    }

    const info = this.buscarInfoNodo(nodoId);
    if (!info) {
      this.showMessage('error', 'Error', 'Nodo no encontrado.');
      return;
    }

    const isLeaf = this.editForm.tipo === 'hoja';
    const impacto = isLeaf ? this.editForm.impacto : undefined;
    const urgencia = isLeaf ? this.editForm.urgencia : undefined;
    const score = isLeaf && impacto && urgencia ? this.calcularScore(impacto, urgencia) : undefined;
    const sla = isLeaf && impacto && urgencia ? this.obtenerSLA(impacto, urgencia) : undefined;
    const cuadrante = score ? this.clasificarCuadrante(score) : undefined;

    try {
      const target = info.nodo;
      target.nombre = nombre;
      target.tipo = this.editForm.tipo;
      if (isLeaf) {
        target.urgencia = urgencia;
        target.score = score;
        target.criticidad = score;
        target.prioridad = cuadrante ? cuadrante.label : undefined;
        delete (target as any).estimacion;
        delete (target as any).slaRes;
        delete (target as any).slaResp;
        delete (target as any).impacto;
      } else {
        target.activarSubcategorias = true;
      }

      await this.categoriesService.update(info.rootCat, String(info.rootCat.id));
      this.showMessage('success', 'Actualizado', `"${nombre}" actualizado.`);

      this.openEditFormFor = null;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error al actualizar nodo:', error);
      this.showMessage('error', 'Error', error.message || 'Error al actualizar');
    }
  }

  eliminarNodo(nodo: Categoria | Subcategoria): void {
    const info = this.buscarInfoNodo(String(nodo.id));
    if (!info) return;

    const ticketsAsociados = this.obtenerConteoTickets(nodo, info.rootCat);

    if (ticketsAsociados > 0) {
      this.confirmationService.confirm({
        header: 'Categoría con tickets activos',
        message: `Este nodo o sus subcategorías tienen ${ticketsAsociados} ticket(s) asociado(s). No se permite eliminarlo para preservar el historial.`,
        icon: 'pi pi-exclamation-circle',
        acceptLabel: 'Entendido',
        rejectVisible: false,
        acceptButtonStyleClass: 'btn btn-confirm-reject',
        accept: () => {}
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${nodo.nombre}" y sus posibles subcategorías? Esta acción no se puede revertir.`,
      icon: 'pi pi-trash',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'btn btn-confirm-accept',
      rejectButtonStyleClass: 'btn btn-confirm-reject',
      accept: async () => {
        try {
          if (info.parent === null) {
            // Eliminar categoría raíz
            await this.categoriesService.delete(String(nodo.id));
            this.showMessage('success', 'Eliminada', `Categoría "${nodo.nombre}" eliminada.`);
          } else {
            // Eliminar subcategoría a cualquier nivel de profundidad
            nodo.eliminado = true;
            const marcarEliminadoRecursivo = (n: Subcategoria) => {
              n.eliminado = true;
              if (n.subcategorias) {
                n.subcategorias.forEach(marcarEliminadoRecursivo);
              }
            };
            marcarEliminadoRecursivo(nodo as Subcategoria);

            await this.categoriesService.update(info.rootCat, String(info.rootCat.id));
            this.showMessage('success', 'Eliminada', `Subcategoría "${nodo.nombre}" eliminada.`);
          }
          this.cdr.detectChanges();
        } catch (error: any) {
          console.error('Error al eliminar:', error);
          this.showMessage('error', 'Error', 'No se pudo eliminar.');
        }
      }
    });
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
