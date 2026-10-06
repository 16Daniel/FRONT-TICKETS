import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TreeNode } from 'primeng/api';

import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CategoriesService } from '../../services/categories.service';
import { Categoria } from '../../models/categoria.model';
import { Subcategoria } from '../../interfaces/subcategoria.interface';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { UmbralTicketsService, UmbralFiltros } from '../../services/umbral-tickets.service';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { UmbralKpisComponent } from '../../components/umbral-kpis/umbral-kpis.component';
import { UmbralFiltrosComponent } from '../../components/umbral-filtros/umbral-filtros.component';
import { UmbralGraficasComponent } from '../../components/umbral-graficas/umbral-graficas.component';
import { UmbralArbolComponent } from '../../components/umbral-arbol/umbral-arbol.component';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { UmbralRadarService } from '../../services/umbral-radar.service';

@Component({
  selector: 'app-umbral-recurrencias',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, UmbralKpisComponent, UmbralFiltrosComponent, UmbralGraficasComponent, UmbralArbolComponent],
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

  colorScheme: any = {
    domain: ['#d3152a', '#fdb813', '#2563eb', '#16a34a', '#7c3aed', '#0f766e', '#b91c1c', '#ca8a04', '#64748b']
  };

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
  private subscripcionMatriz?: Subscription;

  matrizUrgenciaArea?: MatrizUrgencia;
  
  // Arreglos ya procesados para el Input de la gráfica
  radarDataGeneral: any[] = [];
  radarDataCategorias: { [name: string]: any[] } = {};
  radarDataSucursales: { [name: string]: any[] } = {};
  radarDataUsuarios: { [name: string]: any[] } = {};
  
  datosCategorias: any[] = [];
  datosSucursales: any[] = [];
  datosUsuarios: any[] = [];

  constructor(
    private areasService: AreasService,
    private categoriesService: CategoriesService,
    private branchesService: BranchesService,
    private usersService: UsersService,
    private umbralTicketsService: UmbralTicketsService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private umbralRadarService: UmbralRadarService,
    private cdr: ChangeDetectorRef
  ) {}

  aplicarFiltrosEvent(event: any): void {
    this.fechaInicio = event.fechaInicio;
    this.fechaFin = event.fechaFin;
    this.sucursalesSeleccionadas = event.sucursalesSeleccionadas;
    this.usuariosSeleccionados = event.usuariosSeleccionados;
    this.aplicarFiltros();
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
          // Conteo básico para el arbol
          const key = t.idSubcategoria || t.idCategoria;
          if (key) {
            this.ticketCounts[key] = (this.ticketCounts[key] || 0) + 1;
          }

          const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
          nameCounts[catName] = (nameCounts[catName] || 0) + 1;
          if (nameCounts[catName] > maxTickets) {
            maxTickets = nameCounts[catName];
            topCatName = catName;
          }

          if (t.idResponsable) {
            const isRol4 = this.usuariosRol4.some(u => u.id === t.idResponsable);
            if (isRol4) {
              userCounts[t.idResponsable] = (userCounts[t.idResponsable] || 0) + 1;
              if (userCounts[t.idResponsable] > maxUsuarios) {
                maxUsuarios = userCounts[t.idResponsable];
                const u = this.usuariosRol4.find(x => x.id === t.idResponsable);
                topUsuarioName = u ? `${u.nombre} ${u.apellidoP}`.trim() : 'Desconocido';
              }
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

        this.datosCategorias = Object.keys(nameCounts).map(name => ({
          name: name,
          value: nameCounts[name]
        })).sort((a, b) => b.value - a.value);

        this.datosSucursales = Object.keys(sucursalCounts).map(id => {
          const s = this.sucursales.find(x => String(x.id) === id);
          return {
            name: s ? s.nombre : `Sucursal ${id}`,
            value: sucursalCounts[id]
          };
        }).sort((a, b) => b.value - a.value);

        this.datosUsuarios = Object.keys(userCounts).map(id => {
          const u = this.usuariosRol4.find(x => x.id === id);
          return {
            name: u ? `${u.nombre} ${u.apellidoP}`.trim() : `Usuario ${id}`,
            value: userCounts[id]
          };
        }).sort((a, b) => b.value - a.value);

        // ==== CÁLCULO DE DATOS RADAR USANDO EL SERVICIO ====
        const radarResult = this.umbralRadarService.procesarDatosRadar(
          tickets, 
          this.matrizUrgenciaArea, 
          this.sucursales,
          this.usuariosRol4
        );
        this.radarDataGeneral = radarResult.radarDataGeneral;
        this.radarDataCategorias = radarResult.radarDataCategorias;
        this.radarDataSucursales = radarResult.radarDataSucursales;
        this.radarDataUsuarios = radarResult.radarDataUsuarios;

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
      this.cargarMatrizYFiltros();
      this.cdr.detectChanges();
    });
  }

  private cargarMatrizYFiltros(): void {
    this.subscripcionMatriz?.unsubscribe();
    this.subscripcionMatriz = this.matrizUrgenciaService.obtenerMatrizPorArea(this.areaSeleccionadaId).subscribe(mat => {
      this.matrizUrgenciaArea = mat;
      this.cargarCategorias();
      this.cargarUsuariosPorArea();
      this.aplicarFiltros();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    
    // Al cambiar de área, limpiar conteos y filtros
    this.ticketCounts = {};
    
    this.cargarMatrizYFiltros();
  }

  private cargarCategorias(): void {
    this.subscripcionCategorias?.unsubscribe();
    this.subscripcionCategorias = this.categoriesService.get(this.areaSeleccionadaId).subscribe((cats: Categoria[]) => {
      this.categoriasActuales = cats;
      this.dataArbol = this.transformarAChart(cats);
      this.cdr.detectChanges();
    });
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

