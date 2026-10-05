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
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
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

  aplicarFiltros(): void {
    // Para el siguiente paso: Aquí implementaremos la lógica real
    console.log('Filtros aplicados:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      sucursales: this.sucursalesSeleccionadas,
      usuarios: this.usuariosSeleccionados
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
      this.cdr.detectChanges();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.cargarCategorias();
    this.cargarUsuariosPorArea();
  }

  private cargarCategorias(): void {
    this.subscripcionCategorias?.unsubscribe();
    this.subscripcionCategorias = this.categoriesService.get(this.areaSeleccionadaId).subscribe((cats: Categoria[]) => {
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
        esRama: esRama
      },
      children: hijos.map(h => this.mapearNodo(h))
    };
  }
}

