import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { CrearTicketDialogComponent } from '../../../tickets/dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { TicketsActivoFijoDialogComponent } from '../../dialogs/tickets-activo-fijo-dialog/tickets-activo-fijo-dialog.component';
import { MantenimientosActivoFijoDialogComponent } from '../../dialogs/mantenimientos-activo-fijo-dialog/mantenimientos-activo-fijo-dialog.component';
import { ActivosFijosService } from '../../services/activos-fijos.service';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { AreasService } from '../../../areas/services/areas.service';
import { AreasActivosFijosService } from '../../services/areas-activos-fijos.service';
import { CategoriasActivosFijosService } from '../../services/categorias-activos-fijos.service';
import { EstatusActivosFijosService } from '../../services/estatus-activos-fijos.service';
import { UbicacionesActivosFijosService } from '../../services/ubicaciones-activos-fijos.service';
import { ActivoFijo } from '../../models/activo-fijo.model';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { AreaActivoFijo } from '../../models/area-activo-fijo.model';
import { CategoriaActivoFijo } from '../../models/categoria-activo-fijo.model';
import { UbicacionActivoFijo } from '../../models/ubicacion-activo-fijo.model';
import { EstatusActivoFijo } from '../../models/estatus-activo-fijo.model';

@Component({
  selector: 'app-activo-fijo-detalle-page',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    TicketsActivoFijoDialogComponent,
    MantenimientosActivoFijoDialogComponent,
    ButtonModule,
    CrearTicketDialogComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './activo-fijo-detalle-page.component.html',
  styleUrl: './activo-fijo-detalle-page.component.scss'
})

export default class ActivoFijoDetallePageComponent implements OnInit {
  activo: ActivoFijo = new ActivoFijo;
  mostrarModalMantenimientos: boolean = false;
  mostrarModalTickets: boolean = false;
  mostrarModalGenerateTicket: boolean = false;

  sucursales: Sucursal[] = [];
  areasActivosFijos: AreaActivoFijo[] = [];
  categoriasActivosFijos: CategoriaActivoFijo[] = [];
  ubicacionesActivosFijos: UbicacionActivoFijo[] = [];
  estatusActivosFijos: EstatusActivoFijo[] = [];

  constructor(
    private fixedAssetsService: ActivosFijosService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private branchesService: SucursalesService,
    private areasService: AreasService,
    private areasFixedAssetsService: AreasActivosFijosService,
    private categoriesFixedAssetsService: CategoriasActivosFijosService,
    private statusFixedAssetsService: EstatusActivosFijosService,
    private locationsFixedAssetsService: UbicacionesActivosFijosService,
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerAreasActivosFijos();
    this.obtenerCategoriasActivosFijos();
    this.obtenerUbicacionesActivosFijos();
    this.obtenerEstatusActivosFijos();

    const referencia = this.route.snapshot.paramMap.get('referencia')?.trim() || '';

    this.fixedAssetsService.getByReference(referencia!).subscribe((activo) => {
      if (activo) {
        this.activo = activo!;
      }
      else {
        this.showMessage('warn', 'Error', 'No se encontró activo con referencia ' + referencia);
      }
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));

        // this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerAreasActivosFijos() {
    this.areasFixedAssetsService.get().subscribe({
      next: (data) => {
        this.areasActivosFijos = data.map((item: any) => ({
          ...item,
        }));;
        // this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerCategoriasActivosFijos() {
    this.categoriesFixedAssetsService.get().subscribe({
      next: (data) => {
        this.categoriasActivosFijos = data.map((item: any) => ({
          ...item,
        }));;
        // this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerUbicacionesActivosFijos() {
    this.locationsFixedAssetsService.get().subscribe({
      next: (data) => {
        this.ubicacionesActivosFijos = data.map((item: any) => ({
          ...item,
        }));
        // this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerEstatusActivosFijos() {
    this.statusFixedAssetsService.get().subscribe({
      next: (data) => {
        this.estatusActivosFijos = data.map((item: any) => ({
          ...item,
        }));
        // this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getCostoTotalMantenimientos(): number {
    if (!this.activo.mantenimientos) return 0;

    return this.activo.mantenimientos
      .filter(m => !m.eliminado)
      .reduce((total, m) => total + (m.costo || 0), 0);
  }

  get superaCostoActivo(): boolean {
    return !!this.activo.costo && this.getCostoTotalMantenimientos() > this.activo.costo;
  }

  obtenerClaseEstatus(idEstatus: string): string {
    const estatus = (this.nombreEstatusActivoFijo(idEstatus) || '').toUpperCase().trim();
    if (['NUEVO', 'ACTIVO', 'BUENO', 'OPERATIVO'].includes(estatus)) {
      return 'status-ok';
    }
    if (['USADO', 'REGULAR', 'POR VALIDAR'].includes(estatus)) {
      return 'status-warning';
    }
    if (['EN REPARACIÓN', 'EN REPARACION', 'REPARADO', 'POR INSTALAR'].includes(estatus)) {
      return 'status-purple';
    }
    if (['DESCOMPUESTO', 'BAJA', 'DAÑADO', 'CRÍTICO'].includes(estatus)) {
      return 'status-critical';
    }
    return 'status-info';
  }

  nombreSucursal = (idSucursal: string) => this.sucursales.find(x => x.id == idSucursal)?.nombre;
  nombreArea = (idArea: string) => this.areasService.areas.find(x => x.id == idArea)?.nombre;
  nombreAreaActivoFijo = (idAreaActivoFijo: string) => this.areasActivosFijos.find(x => x.id == idAreaActivoFijo)?.nombre;
  nombreCategoriaActivoFijo = (idCategoriaActivoFijo: string) => this.categoriasActivosFijos.find(x => x.id == idCategoriaActivoFijo)?.nombre;
  nombreEstatusActivoFijo = (idEstatusActivoFijo: string) => this.estatusActivosFijos.find(x => x.id == idEstatusActivoFijo)?.nombre;
  nombreUbicacionActivoFijo = (idUbicacionActivoFijo: string) => this.ubicacionesActivosFijos.find(x => x.id == idUbicacionActivoFijo)?.nombre;
}
