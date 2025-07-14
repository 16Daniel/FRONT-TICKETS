import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

import { ActivoFijo } from '../../../models/activo-fijo.model';
import { FixedAssetsService } from '../../../services/fixed-assets.service';
import { ModalFixedAssetsCreateComponent } from '../../../modals/fixed-assets/modal-fixed-assets-create/modal-fixed-assets-create.component';
import { Usuario } from '../../../models/usuario.model';
import { BranchesService } from '../../../services/branches.service';
import { AreasService } from '../../../services/areas.service';
import { AreasFixedAssetsService } from '../../../services/areas-fixed-assets.service';
import { CategoriesFixedAssetsService } from '../../../services/categories-activos-fijos.service';
import { StatusFixedAssetsService } from '../../../services/status-fixed-assets.service';
import { LocationsFixedAssetsService } from '../../../services/locations-fixed-assets.service';
import { Area } from '../../../models/area.model';
import { Sucursal } from '../../../models/sucursal.model';
import { AreaActivoFijo } from '../../../models/area-activo-fijo.model';
import { CategoriaActivoFijo } from '../../../models/categoria-activo-fijo.model';
import { UbicacionActivoFijo } from '../../../models/ubicacion-activo-fijo.model';
import { EstatusActivoFijo } from '../../../models/estatus-activo-fijo.model';
import { ModalFixedAssetTicketsComponent } from '../../../modals/fixed-assets/modal-fixed-asset-tickets/modal-fixed-asset-tickets.component';
import { ModalFixedAssetMaintenanceComponent } from '../../../modals/fixed-assets/modal-fixed-asset-maintenance/modal-fixed-asset-maintenance.component';

@Component({
  selector: 'app-fixed-assets',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ModalFixedAssetsCreateComponent,
    ModalFixedAssetTicketsComponent,
    ModalFixedAssetMaintenanceComponent,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './fixed-assets.component.html',
  styleUrl: './fixed-assets.component.scss'
})

export default class FixedAssetsComponent implements OnInit {
  esNuevoActivoFijo: boolean = false;
  mostrarModalActivoFijo: boolean = false;
  activosFijos: ActivoFijo[] = [];
  activoFijoSeleccionada: ActivoFijo = new ActivoFijo;
  subscripcion: Subscription | undefined;
  usuario: Usuario;
  mostrarModalTickets: boolean = false;
  // activoSeleccionado: ActivoFijo | undefined;
  mostrarModalMantenimientos: boolean = false;

  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  areasActivosFijos: AreaActivoFijo[] = [];
  categoriasActivosFijos: CategoriaActivoFijo[] = [];
  ubicacionesActivosFijos: UbicacionActivoFijo[] = [];
  estatusActivosFijos: EstatusActivoFijo[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private fixedAssetsService: FixedAssetsService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private areasFixedAssetsService: AreasFixedAssetsService,
    private categoriesFixedAssetsService: CategoriesFixedAssetsService,
    private statusFixedAssetsService: StatusFixedAssetsService,
    private locationsFixedAssetsService: LocationsFixedAssetsService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerActivosFijos();

    this.obtenerSucursales();
    this.obtenerAreas();
    this.obtenerAreasActivosFijos();
    this.obtenerCategoriasActivosFijos();
    this.obtenerUbicacionesActivosFijos();
    this.obtenerEstatusActivosFijos();
  }

  ngOnDestroy() {
    if (this.subscripcion != undefined) {
      this.subscripcion.unsubscribe();
    }
  }

  obtenerActivosFijos() {
    this.subscripcion = this.fixedAssetsService.get(this.usuario.idArea).subscribe(result => {
      this.activosFijos = result;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    });
  }

  abrirModalCrearActivoFijo() {
    this.esNuevoActivoFijo = true;
    this.activoFijoSeleccionada = new ActivoFijo;
    this.mostrarModalActivoFijo = true;
  }

  abrirModalEditarActivoFijo(activoFijo: ActivoFijo) {
    this.esNuevoActivoFijo = false;
    this.mostrarModalActivoFijo = true;
    this.activoFijoSeleccionada = activoFijo;
  }

  abrirModalMantenimientos(activoFijo: ActivoFijo) {
    this.mostrarModalMantenimientos = true;
    this.activoFijoSeleccionada = activoFijo;
  }

  confirmaEliminacion(id: string) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminarActivoFijo(id);
      },
      reject: () => { },
    });
  }

  getCostoTotalMantenimientos(activo: ActivoFijo): number {
    if (!activo.mantenimientos) return 0;

    return activo.mantenimientos
      .filter(m => !m.eliminado)
      .reduce((total, m) => total + (m.costo || 0), 0);
  }

  async eliminarActivoFijo(idActivoFijo: string) {
    await this.fixedAssetsService.delete(idActivoFijo);
    this.showMessage('success', 'Success', 'Eliminado correctamente');
  }

  cerrarModalActivoFijo() {
    this.mostrarModalActivoFijo = false;
    this.activoFijoSeleccionada = new ActivoFijo;;
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

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerAreas() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  mostrarTickets = (activo: ActivoFijo) => {
    this.mostrarModalTickets = true;
    this.activoFijoSeleccionada = activo
  }


  nombreSucursal = (idSucursal: string) => this.sucursales.find(x => x.id == idSucursal)?.nombre;
  nombreArea = (idArea: string) => this.areas.find(x => x.id == idArea)?.nombre;
  nombreAreaActivoFijo = (idAreaActivoFijo: string) => this.areasActivosFijos.find(x => x.id == idAreaActivoFijo)?.nombre;
  nombreCategoriaActivoFijo = (idCategoriaActivoFijo: string) => this.categoriasActivosFijos.find(x => x.id == idCategoriaActivoFijo)?.nombre;
  nombreEstatusActivoFijo = (idEstatusActivoFijo: string) => this.estatusActivosFijos.find(x => x.id == idEstatusActivoFijo)?.nombre;
  nombreUbicacionActivoFijo = (idUbicacionActivoFijo: string) => this.ubicacionesActivosFijos.find(x => x.id == idUbicacionActivoFijo)?.nombre;
}
