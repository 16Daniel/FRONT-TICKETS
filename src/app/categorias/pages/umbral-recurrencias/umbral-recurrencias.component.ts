import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';

import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CategoriesService } from '../../services/categories.service';
import { Categoria } from '../../models/categoria.model';
import { Subcategoria } from '../../interfaces/subcategoria.interface';
import { TooltipModule } from 'primeng/tooltip';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { UmbralTicketsService, UmbralFiltros } from '../../services/umbral-tickets.service';
import { Ticket } from '../../../tickets/interfaces/ticket.model';

@Component({
  selector: 'app-umbral-recurrencias',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, OrganizationChartModule, TooltipModule, CalendarModule, MultiSelectModule],
  templateUrl: './umbral-recurrencias.component.html',
  styleUrl: './umbral-recurrencias.component.scss'
})
export class UmbralRecurrenciasComponent implements OnInit, OnDestroy {
  readonly String = String;
  areas: Area[] = [];
  areaSeleccionadaId: string = '1';

  categoriasActuales: Categoria[] = [];
  ticketCounts: { [key: string]: number } = {};
  isApplyingFilters = false;

  dataArbol: TreeNode[] = [];
  zoomLevel: number = 1;

  @ViewChild('panContainer') panContainer?: ElementRef<HTMLElement>;

  // Panning variables
  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;

  // Filter variables
  fechaInicio: Date | null = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaFin: Date | null = new Date();
  sucursales: Sucursal[] = [];
  sucursalesSeleccionadas: Sucursal[] = [];
  usuariosRol4: Usuario[] = [];
  usuariosSeleccionados: Usuario[] = [];

  private subscripcionAreas?: Subscription;
  private subscripcionCategorias?: Subscription;
  private subscripcionSucursales?: Subscription;
  private subscripcionUsuarios?: Subscription;

  constructor(
    private areasService: AreasService,
    private categoriesService: CategoriesService,
    private branchesService: BranchesService,
    private usersService: UsersService,
    private umbralTicketsService: UmbralTicketsService,
    private cdr: ChangeDetectorRef
  ) {}

  zoomIn(): void {
    if (this.zoomLevel < 2) {
      this.zoomLevel += 0.1;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.3) {
      this.zoomLevel -= 0.1;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
  }

  onMouseDown(e: MouseEvent, container: HTMLElement): void {
    // Solo permitir drag con el botón principal
    if (e.button !== 0) return;
    
    this.isDragging = true;
    this.startX = e.pageX - container.offsetLeft;
    this.startY = e.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent, container: HTMLElement): void {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 1.5; // Multiplicador de velocidad
    const walkY = (y - this.startY) * 1.5;
    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  onWheel(e: WheelEvent): void {
    // Prevenir el scroll por defecto de la página
    e.preventDefault();
    if (e.deltaY < 0) {
      this.zoomIn(); // Hacia arriba, acercar
    } else if (e.deltaY > 0) {
      this.zoomOut(); // Hacia abajo, alejar
    }
  }

  ngOnInit(): void {
    this.cargarAreas();
    this.cargarFiltros();
  }

  ngOnDestroy(): void {
    this.subscripcionAreas?.unsubscribe();
    this.subscripcionCategorias?.unsubscribe();
    this.subscripcionSucursales?.unsubscribe();
    this.subscripcionUsuarios?.unsubscribe();
  }

  private cargarFiltros(): void {
    this.subscripcionSucursales = this.branchesService.get().subscribe(sucursales => {
      this.sucursales = sucursales;
      this.cdr.detectChanges();
    });
  }

  private cargarUsuariosPorArea(): void {
    this.subscripcionUsuarios?.unsubscribe();
    this.subscripcionUsuarios = this.usersService.getUsuariosPorRol(['4'], this.areaSeleccionadaId).subscribe(usuarios => {
      this.usuariosRol4 = usuarios.map(u => ({
        ...u,
        nombreCompleto: `${u.nombre} ${u.apellidoP} ${u.apellidoM}`.trim()
      }));
      // Limpiar selecciones al cambiar de área
      this.usuariosSeleccionados = [];
      this.cdr.detectChanges();
    });
  }

  totalTickets: number = 0;
  categoriaTopTickets: { nombre: string, conteo: number } | null = null;
  usuarioTopTickets: { nombre: string, conteo: number } | null = null;
  sucursalTopTickets: { nombre: string, conteo: number } | null = null;

  aplicarFiltros(): void {
    this.isApplyingFilters = true;
    const filtros: UmbralFiltros = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      idSucursales: this.sucursalesSeleccionadas.map(s => String(s.id)),
      idUsuarios: this.usuariosSeleccionados.map(u => String(u.id))
    };

    this.umbralTicketsService.getTicketsPorFiltros(this.areaSeleccionadaId, filtros).subscribe({
      next: (tickets: Ticket[]) => {
        // Reiniciar conteos
        this.ticketCounts = {};
        
        let maxTickets = 0;
        let topCatName = '';
        const nameCounts: { [name: string]: number } = {};

        let maxUsuarios = 0;
        let topUsuarioName = '';
        const userCounts: { [id: string]: number } = {};

        let maxSucursales = 0;
        let topSucursalName = '';
        const sucursalCounts: { [id: string]: number } = {};

        // Contar tickets agrupando por idSubcategoria o idCategoria
        tickets.forEach(t => {
          const key = t.idSubcategoria || t.idCategoria;
          if (key) {
            this.ticketCounts[key] = (this.ticketCounts[key] || 0) + 1;
          }

          const name = t.nombreSubcategoria || t.nombreCategoria;
          if (name) {
            nameCounts[name] = (nameCounts[name] || 0) + 1;
            if (nameCounts[name] > maxTickets) {
              maxTickets = nameCounts[name];
              topCatName = name;
            }
          }

          if (t.idUsuario) {
            userCounts[t.idUsuario] = (userCounts[t.idUsuario] || 0) + 1;
            if (userCounts[t.idUsuario] > maxUsuarios) {
              maxUsuarios = userCounts[t.idUsuario];
              const u = this.usersService.usuarios.find(x => x.id === t.idUsuario);
              topUsuarioName = u ? `${u.nombre} ${u.apellidoP}`.trim() : 'Desconocido';
            }
          }

          if (t.idSucursal) {
            const sId = String(t.idSucursal);
            sucursalCounts[sId] = (sucursalCounts[sId] || 0) + 1;
            if (sucursalCounts[sId] > maxSucursales) {
              maxSucursales = sucursalCounts[sId];
              const s = this.sucursales.find(x => String(x.id) === sId);
              topSucursalName = s ? s.nombre : `Sucursal ${sId}`;
            }
          }
        });

        this.totalTickets = tickets.length;
        this.categoriaTopTickets = maxTickets > 0 ? { nombre: topCatName, conteo: maxTickets } : null;
        this.usuarioTopTickets = maxUsuarios > 0 ? { nombre: topUsuarioName, conteo: maxUsuarios } : null;
        this.sucursalTopTickets = maxSucursales > 0 ? { nombre: topSucursalName, conteo: maxSucursales } : null;

        // Refrescar el árbol
        if (this.categoriasActuales.length > 0) {
          this.dataArbol = this.transformarAChart(this.categoriasActuales);
        }
        
        this.isApplyingFilters = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error aplicando filtros', err);
        this.isApplyingFilters = false;
      }
    });
  }

  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      if (this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
        this.areaSeleccionadaId = String(this.areas[0].id);
      }
      this.cargarCategorias();
      this.cargarUsuariosPorArea();
      this.aplicarFiltros();
      this.cdr.detectChanges();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    
    // Al cambiar de área, limpiar conteos y filtros (opcional, pero limpiar conteos es bueno)
    this.ticketCounts = {};
    
    this.cargarCategorias();
    this.cargarUsuariosPorArea();
    this.aplicarFiltros();
  }

  private cargarCategorias(): void {
    this.subscripcionCategorias?.unsubscribe();
    this.subscripcionCategorias = this.categoriesService.get(this.areaSeleccionadaId).subscribe((cats: Categoria[]) => {
      this.categoriasActuales = cats;
      this.dataArbol = this.transformarAChart(cats);
      this.cdr.detectChanges();
      this.centrarScroll();
    });
  }

  private centrarScroll(): void {
    setTimeout(() => {
      if (this.panContainer && this.panContainer.nativeElement) {
        const el = this.panContainer.nativeElement;
        // Si el contenido es más ancho que el contenedor, hacer scroll al centro
        if (el.scrollWidth > el.clientWidth) {
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        }
      }
    }, 100);
  }

  private transformarAChart(categorias: Categoria[]): TreeNode[] {
    const areaActual = this.areas.find(a => String(a.id) === this.areaSeleccionadaId);
    
    // Nodo raíz ficticio para el área, conecta todas las categorías raíz
    const nodoRaizArea: TreeNode = {
      label: areaActual ? areaActual.nombre : 'Área',
      type: 'area',
      expanded: true,
      data: {
        tipo: 'area'
      },
      children: categorias.filter(c => !c.eliminado).map(cat => this.mapearNodo(cat))
    };

    return [nodoRaizArea];
  }

  private mapearNodo(nodo: Categoria | Subcategoria): TreeNode {
    const hijos = nodo.subcategorias ? nodo.subcategorias.filter(s => !s.eliminado) : [];
    
    // Si tiene hijos o si explicitly es rama, se considera rama
    const esRama = nodo.tipo === 'rama' || hijos.length > 0 || nodo.activarSubcategorias;

    return {
      label: nodo.nombre,
      type: esRama ? 'rama' : 'hoja',
      expanded: true,
      data: {
        nodo: nodo,
        esRama: esRama,
        ticketCount: !esRama ? (this.ticketCounts[String(nodo.id)] || 0) : 0
      },
      children: hijos.map(h => this.mapearNodo(h))
    };
  }
}

