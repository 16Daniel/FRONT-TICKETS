import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { ActivoFijo } from '../../../../models/activo-fijo.model';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { BranchesService } from '../../../../services/branches.service';
import { AreasFixedAssetsService } from '../../../../services/areas-fixed-assets.service';
import { CategoriesFixedAssetsService } from '../../../../services/categories-activos-fijos.service';
import { StatusFixedAssetsService } from '../../../../services/status-fixed-assets.service';
import { LocationsFixedAssetsService } from '../../../../services/locations-fixed-assets.service';
import { Sucursal } from '../../../../models/sucursal.model';
import { AreaActivoFijo } from '../../../../models/area-activo-fijo.model';
import { CategoriaActivoFijo } from '../../../../models/categoria-activo-fijo.model';
import { UbicacionActivoFijo } from '../../../../models/ubicacion-activo-fijo.model';
import { EstatusActivoFijo } from '../../../../models/estatus-activo-fijo.model';
import { ModalFixedAssetTicketsComponent } from '../../../../modals/fixed-assets/modal-fixed-asset-tickets/modal-fixed-asset-tickets.component';
import { ModalFixedAssetMaintenanceComponent } from '../../../../modals/fixed-assets/modal-fixed-asset-maintenance/modal-fixed-asset-maintenance.component';
import { ModalFaGenerateTicketComponent } from '../../dialogs/modal-fa-generate-ticket/modal-fa-generate-ticket.component';
import { AreasService } from '../../../../services/areas.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    ModalFixedAssetTicketsComponent,
    ModalFixedAssetMaintenanceComponent,
    ButtonModule,
    ModalFaGenerateTicketComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})

export default class DetailComponent implements OnInit {
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
    private fixedAssetsService: FixedAssetsService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private areasFixedAssetsService: AreasFixedAssetsService,
    private categoriesFixedAssetsService: CategoriesFixedAssetsService,
    private statusFixedAssetsService: StatusFixedAssetsService,
    private locationsFixedAssetsService: LocationsFixedAssetsService,
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

  nombreSucursal = (idSucursal: string) => this.sucursales.find(x => x.id == idSucursal)?.nombre;
  nombreArea = (idArea: string) => this.areasService.areas.find(x => x.id == idArea)?.nombre;
  nombreAreaActivoFijo = (idAreaActivoFijo: string) => this.areasActivosFijos.find(x => x.id == idAreaActivoFijo)?.nombre;
  nombreCategoriaActivoFijo = (idCategoriaActivoFijo: string) => this.categoriasActivosFijos.find(x => x.id == idCategoriaActivoFijo)?.nombre;
  nombreEstatusActivoFijo = (idEstatusActivoFijo: string) => this.estatusActivosFijos.find(x => x.id == idEstatusActivoFijo)?.nombre;
  nombreUbicacionActivoFijo = (idUbicacionActivoFijo: string) => this.ubicacionesActivosFijos.find(x => x.id == idUbicacionActivoFijo)?.nombre;
}
