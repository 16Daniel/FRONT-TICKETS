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
import * as XLSX from 'xlsx';

import { DropdownModule } from 'primeng/dropdown';
import { ModalFixedAssetsCreateComponent } from '../../dialogs/modal-fixed-assets-create/modal-fixed-assets-create.component';
import { ModalFixedAssetTicketsComponent } from '../../dialogs/modal-fixed-asset-tickets/modal-fixed-asset-tickets.component';
import { ModalFixedAssetMaintenanceComponent } from '../../dialogs/modal-fixed-asset-maintenance/modal-fixed-asset-maintenance.component';
import { BuscarPorReferenciaPipe } from '../../../shared/pipes/buscar-por-referencia.pipe';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { FixedAssetsService } from '../../services/fixed-assets.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { AreasFixedAssetsService } from '../../services/areas-fixed-assets.service';
import { CategoriesFixedAssetsService } from '../../services/categories-activos-fijos.service';
import { StatusFixedAssetsService } from '../../services/status-fixed-assets.service';
import { LocationsFixedAssetsService } from '../../services/locations-fixed-assets.service';
import { ActivoFijo } from '../../interfaces/activo-fijo.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { AreaActivoFijo } from '../../interfaces/area-activo-fijo.model';
import { CategoriaActivoFijo } from '../../interfaces/categoria-activo-fijo.model';
import { UbicacionActivoFijo } from '../../interfaces/ubicacion-activo-fijo.model';
import { EstatusActivoFijo } from '../../interfaces/estatus-activo-fijo.model';

@Component({
  selector: 'app-fixed-assets-page',
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
    TooltipModule,
    DropdownModule,
    BuscarPorReferenciaPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './fixed-assets-page.component.html',
  styleUrl: './fixed-assets-page.component.scss'
})

export default class FixedAssetsPageComponent implements OnInit {
  esNuevoActivoFijo: boolean = false;
  mostrarModalActivoFijo: boolean = false;
  activosFijos: ActivoFijo[] = [];
  activosFijosFiltrados: ActivoFijo[] = [];
  activoFijoSeleccionada: ActivoFijo = new ActivoFijo;
  subscripcion: Subscription | undefined;
  usuario: Usuario;
  mostrarModalTickets: boolean = false;
  // activoSeleccionado: ActivoFijo | undefined;
  mostrarModalMantenimientos: boolean = false;
  textoBusquedaReferencia: string = '';

  // areas: Area[] = [];
  sucursales: Sucursal[] = [];
  areasActivosFijos: AreaActivoFijo[] = [];
  categoriasActivosFijos: CategoriaActivoFijo[] = [];
  ubicacionesActivosFijos: UbicacionActivoFijo[] = [];
  estatusActivosFijos: EstatusActivoFijo[] = [];

  idSucursalFiltro: string | undefined;
  idAreaFiltro: string | undefined;
  idLocacionFiltro: string | undefined;
  idCategoriaFiltro: string | undefined;
  idEstatusFiltro: string | undefined;
  idUbicacionFiltro: string | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private fixedAssetsService: FixedAssetsService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private branchesService: BranchesService,
    public areasService: AreasService,
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
    let idArea = this.usuario.idRol == '1' ? undefined : this.usuario.idArea;

    this.subscripcion = this.fixedAssetsService.get(idArea).subscribe(result => {
      this.activosFijos = result.sort((a, b) => {
        const idA = Number(a.idSucursal);
        const idB = Number(b.idSucursal);
        return idA - idB;
      });
      this.activosFijosFiltrados = this.activosFijos;
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
    this.activoFijoSeleccionada = { ...activoFijo };
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

  filtrarActivosFijos() {
    this.activosFijosFiltrados = this.activosFijos.filter(activo => {
      return (!this.idSucursalFiltro || activo.idSucursal === this.idSucursalFiltro) &&
        (!this.idAreaFiltro || activo.idArea === this.idAreaFiltro) &&
        (!this.idLocacionFiltro || activo.idAreaActivoFijo === this.idLocacionFiltro) &&
        (!this.idCategoriaFiltro || activo.idCategoriaActivoFijo === this.idCategoriaFiltro) &&
        (!this.idEstatusFiltro || activo.idEstatusActivoFijo === this.idEstatusFiltro) &&
        (!this.idUbicacionFiltro || activo.idUbicacionActivoFijo === this.idUbicacionFiltro);
    });
  }

  limpiarFiltros() {
    this.idSucursalFiltro = undefined;
    this.idAreaFiltro = undefined;
    this.idLocacionFiltro = undefined;
    this.idCategoriaFiltro = undefined;
    this.idEstatusFiltro = undefined;
    this.idUbicacionFiltro = undefined;

    this.activosFijosFiltrados = this.activosFijos;
  }

  obtenerCostoTotalActivos(lista: ActivoFijo[]): number {
    return lista.reduce((total, activo) => total + (activo.costo || 0), 0);
  }

  get costoTotalFiltrado(): number {
    const listaFiltrada = this.activosFijosFiltrados.filter(activo =>
      !this.textoBusquedaReferencia ||
      activo.referencia?.toLowerCase().includes(this.textoBusquedaReferencia.toLowerCase())
    );
    return this.obtenerCostoTotalActivos(listaFiltrada);
  }

  exportToExcel(filename: string = 'listado_activos.xlsx'): void {
    // Transformar los datos para tener una fila por artículo
    const datosExportar = this.transformarDatos();

    // Crear libro de trabajo y hoja
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activos');

    // Guardar el archivo
    XLSX.writeFile(wb, filename);
  }

  private transformarDatos(): any[] {

    const datos = this.activosFijosFiltrados.map(a => ({
      REFERENCIA: a.referencia,
      DESCRIPCION: a.descripcion,
      SUCURSAL: this.nombreSucursal(a.idSucursal),
      AREA: this.nombreArea(a.idArea),
      LOCACION: this.nombreAreaActivoFijo(a.idAreaActivoFijo),
      CATEGORIA: this.nombreCategoriaActivoFijo(a.idCategoriaActivoFijo),
      '# MANT': a.mantenimientos.length,
      CONDICION: this.nombreEstatusActivoFijo(a.idEstatusActivoFijo),
      UBICACION: this.nombreUbicacionActivoFijo(a.idUbicacionActivoFijo),
      COSTO: a.costo,
      'COSTO MANT.': this.getCostoTotalMantenimientos(a)
    }));

    return datos;
  }

  nombreSucursal = (idSucursal: string) => this.sucursales.find(x => x.id == idSucursal)?.nombre;
  nombreArea = (idArea: string) => this.areasService.areas.find(x => x.id == idArea)?.nombre;
  nombreAreaActivoFijo = (idAreaActivoFijo: string) => this.areasActivosFijos.find(x => x.id == idAreaActivoFijo)?.nombre;
  nombreCategoriaActivoFijo = (idCategoriaActivoFijo: string) => this.categoriasActivosFijos.find(x => x.id == idCategoriaActivoFijo)?.nombre;
  nombreEstatusActivoFijo = (idEstatusActivoFijo: string) => this.estatusActivosFijos.find(x => x.id == idEstatusActivoFijo)?.nombre;
  nombreUbicacionActivoFijo = (idUbicacionActivoFijo: string) => this.ubicacionesActivosFijos.find(x => x.id == idUbicacionActivoFijo)?.nombre;
}
