import { Component, type OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { BranchesService } from '../../../sucursales/services/branches.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { AreasService } from '../../../areas/services/areas.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { KpisFiltrosComponent } from '../../components/kpis-filtros/kpis-filtros.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { GraficaDesempenoCategoriasComponent } from '../../components/grafica-desempeno-categorias/grafica-desempeno-categorias.component';
import { GraficaDesempenoSucursalesComponent } from '../../components/grafica-desempeno-sucursales/grafica-desempeno-sucursales.component';
import { GraficaDesempenoResponsablesComponent } from '../../components/grafica-desempeno-responsables/grafica-desempeno-responsables.component';

// Servicios de datos para KPIs
import { KpisTicketsService, KpisFiltros } from '../../services/kpis-tickets.service';
import { MatrizUrgenciaService } from '../../../categorias/services/matriz-urgencia.service';

@Component({
  selector: 'app-kpis-tickets-page',
  standalone: true,
  imports: [
    CommonModule,
    KpisFiltrosComponent,
    PageHeaderComponent,
    GraficaDesempenoCategoriasComponent,
    GraficaDesempenoSucursalesComponent,
    GraficaDesempenoResponsablesComponent
  ],
  templateUrl: './kpis-tickets-page.component.html',
  styleUrl: './kpis-tickets-page.component.scss',
})
export default class KpisTicketsPageComponent implements OnInit, OnDestroy {
  readonly String = String;
  
  areas: Area[] = [];
  areaSeleccionadaId: string = '1';
  
  sucursales: Sucursal[] = [];
  usuariosRol4: any[] = [];
  isApplyingFilters = false;

  fechaInicio: Date | null = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaFin: Date | null = new Date();
  
  sucursalesSeleccionadas: any[] = [];
  usuariosSeleccionados: any[] = [];

  // Propiedades para las gráficas
  tickets: Ticket[] = [];
  matrizUrgenciaArea?: MatrizUrgencia;
  colorScheme: any = {
    domain: ['#d3152a', '#fdb813', '#2563eb', '#16a34a', '#7c3aed', '#0f766e', '#b91c1c', '#ca8a04', '#64748b']
  };

  private subscripcionAreas?: Subscription;
  private subscripcionSucursales?: Subscription;
  private subscripcionUsuarios?: Subscription;
  private subscripcionMatriz?: Subscription;

  constructor(
    private branchesService: BranchesService,
    private usersService: UsersService,
    private areasService: AreasService,
    private kpisTicketsService: KpisTicketsService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAreas();
    this.cargarFiltros();
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.subscripcionAreas?.unsubscribe();
    this.subscripcionSucursales?.unsubscribe();
    this.subscripcionUsuarios?.unsubscribe();
    this.subscripcionMatriz?.unsubscribe();
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
      this.aplicarFiltros();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.tickets = []; // Limpiar tickets al cambiar de área
    this.cargarMatrizYFiltros();
  }

  private cargarFiltros(): void {
    this.subscripcionSucursales = this.branchesService.get().subscribe(sucursales => {
      this.sucursales = sucursales;
      this.cdr.detectChanges();
    });
  }

  private cargarUsuarios(): void {
    // Obtenemos todos los usuarios o los filtramos según sea necesario
    this.subscripcionUsuarios = this.usersService.usuarios$.subscribe(usuarios => {
      this.usuariosRol4 = usuarios.map(u => ({
        ...u,
        nombreCompleto: `${u.nombre} ${u.apellidoP} ${u.apellidoM}`.trim()
      }));
      this.cdr.detectChanges();
    });
  }

  aplicarFiltrosEvent(event: any): void {
    this.fechaInicio = event.fechaInicio;
    this.fechaFin = event.fechaFin;
    this.sucursalesSeleccionadas = event.sucursalesSeleccionadas || [];
    this.usuariosSeleccionados = event.usuariosSeleccionados || [];
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.isApplyingFilters = true;
    const filtros: KpisFiltros = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      idSucursales: this.sucursalesSeleccionadas.map(s => String(s.id)),
      idUsuarios: this.usuariosSeleccionados.map(u => String(u.id))
    };

    this.kpisTicketsService.getTicketsPorFiltros(this.areaSeleccionadaId, filtros).subscribe({
      next: (tickets: Ticket[]) => {
        this.tickets = tickets;
        this.isApplyingFilters = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error aplicando filtros', err);
        this.isApplyingFilters = false;
        this.cdr.detectChanges();
      }
    });
  }
}
