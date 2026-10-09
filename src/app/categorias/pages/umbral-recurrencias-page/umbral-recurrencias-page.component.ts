import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CategoriesService } from '../../services/categories.service';
import { Categoria } from '../../models/categoria.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { UmbralTicketsService, UmbralFiltros } from '../../services/umbral-tickets.service';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { UmbralKpisComponent } from '../../components/umbral-kpis/umbral-kpis.component';
import { UmbralFiltrosComponent } from '../../components/umbral-filtros/umbral-filtros.component';
import { UmbralArbolComponent } from '../../components/umbral-arbol/umbral-arbol.component';

@Component({
  selector: 'app-umbral-recurrencias-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PageHeaderComponent, 
    UmbralKpisComponent, 
    UmbralFiltrosComponent, 
    UmbralArbolComponent
  ],
  templateUrl: './umbral-recurrencias-page.component.html',
  styleUrl: './umbral-recurrencias-page.component.scss'
})
export class UmbralRecurrenciasPageComponent implements OnInit, OnDestroy {
  readonly String = String;
  areas: Area[] = [];
  areaSeleccionadaId: string = '1';

  categoriasActuales: Categoria[] = [];
  isApplyingFilters = false;

  // Filter variables
  fechaInicio: Date | null = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaFin: Date | null = new Date();
  sucursales: Sucursal[] = [];
  sucursalesSeleccionadas: Sucursal[] = [];
  usuariosRol4: Usuario[] = [];
  usuariosSeleccionados: Usuario[] = [];

  // Datos crudos
  tickets: Ticket[] = [];
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
      this.usuariosSeleccionados = [];
      this.cdr.detectChanges();
    });
  }

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

  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      if (this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
        this.areaSeleccionadaId = String(this.areas[0].id);
      }
      this.cargarDatosArea();
      this.cdr.detectChanges();
    });
  }

  private cargarDatosArea(): void {
    this.cargarCategorias();
    this.cargarUsuariosPorArea();
    this.aplicarFiltros();
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.tickets = []; // Limpiar tickets al cambiar de área
    this.cargarDatosArea();
  }

  private cargarCategorias(): void {
    this.subscripcionCategorias?.unsubscribe();
    this.subscripcionCategorias = this.categoriesService.get(this.areaSeleccionadaId).subscribe((cats: Categoria[]) => {
      this.categoriasActuales = cats;
      this.cdr.detectChanges();
    });
  }
}


