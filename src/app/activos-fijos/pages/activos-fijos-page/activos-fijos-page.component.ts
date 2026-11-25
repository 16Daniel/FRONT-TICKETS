import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

import { CrearActivoFijoDialogComponent } from '../../dialogs/crear-activo-fijo-dialog/crear-activo-fijo-dialog.component';
import { TicketsActivoFijoDialogComponent } from '../../dialogs/tickets-activo-fijo-dialog/tickets-activo-fijo-dialog.component';
import { MantenimientosActivoFijoDialogComponent } from '../../dialogs/mantenimientos-activo-fijo-dialog/mantenimientos-activo-fijo-dialog.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { BuscarPorReferenciaPipe } from '../../../shared/pipes/buscar-por-referencia.pipe';
import { Usuario } from '../../../usuarios/models/usuario.model';
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

export type EstadoVisualActivo = 'danger' | 'admin' | 'success' | 'warning' | 'neutral';

@Component({
  selector: 'app-activos-fijos-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    CrearActivoFijoDialogComponent,
    TicketsActivoFijoDialogComponent,
    MantenimientosActivoFijoDialogComponent,
    PageHeaderComponent,
    TooltipModule,
    DropdownModule,
    BuscarPorReferenciaPipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './activos-fijos-page.component.html',
  styleUrl: './activos-fijos-page.component.scss',
})
export default class ActivosFijosPageComponent implements OnInit, OnDestroy {
  esNuevoActivoFijo: boolean = false;
  mostrarModalActivoFijo: boolean = false;
  activosFijos: ActivoFijo[] = [];
  activosFijosFiltrados: ActivoFijo[] = [];
  activoFijoSeleccionada: ActivoFijo = new ActivoFijo();
  usuario: Usuario;
  mostrarModalTickets: boolean = false;
  mostrarModalMantenimientos: boolean = false;
  textoBusquedaReferencia: string = '';

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

  private subscriptions: Subscription[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private fixedAssetsService: ActivosFijosService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private branchesService: SucursalesService,
    public areasService: AreasService,
    private areasFixedAssetsService: AreasActivosFijosService,
    private categoriesFixedAssetsService: CategoriasActivosFijosService,
    private statusFixedAssetsService: EstatusActivosFijosService,
    private locationsFixedAssetsService: UbicacionesActivosFijosService,
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  obtenerActivosFijos(): void {
    let idArea = this.usuario.idRol == '1' ? undefined : this.usuario.idArea;
    idArea =
      this.usuario.idArea == '10' || this.usuario.idArea == '13'
        ? undefined
        : this.usuario.idArea;

    const sub = this.fixedAssetsService.get(idArea).subscribe({
      next: (result) => {
        this.activosFijos = result.sort((a, b) => Number(a.idSucursal) - Number(b.idSucursal));
        this.filtrarActivosFijos();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    this.subscriptions.push(sub);
  }

  abrirModalCrearActivoFijo(): void {
    this.esNuevoActivoFijo = true;
    this.activoFijoSeleccionada = new ActivoFijo();
    this.mostrarModalActivoFijo = true;
  }

  abrirModalEditarActivoFijo(activoFijo: ActivoFijo): void {
    this.esNuevoActivoFijo = false;
    this.mostrarModalActivoFijo = true;
    this.activoFijoSeleccionada = { ...activoFijo };
  }

  abrirModalMantenimientos(activoFijo: ActivoFijo): void {
    this.mostrarModalMantenimientos = true;
    this.activoFijoSeleccionada = activoFijo;
  }

  confirmaEliminacion(id: string): void {
    this.confirmationService.confirm({
      header: '¿Eliminar activo fijo?',
      message: '¿Está seguro que desea eliminar este activo fijo?',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.eliminarActivoFijo(id);
      },
      reject: () => { },
    });
  }

  getCostoTotalMantenimientos(activo: ActivoFijo): number {
    if (!activo.mantenimientos) return 0;

    return activo.mantenimientos
      .filter((m) => !m.eliminado)
      .reduce((total, m) => total + (m.costo || 0), 0);
  }

  esMantenimientoExcedido(activo: ActivoFijo): boolean {
    const costoMant = this.getCostoTotalMantenimientos(activo);
    return costoMant > 0 && costoMant >= (activo.costo || 0);
  }

  obtenerTipoEstadoRow(activo: ActivoFijo): EstadoVisualActivo {
    if (this.esMantenimientoExcedido(activo)) {
      return 'danger';
    }
    const estatus = (this.nombreEstatusActivoFijo(activo.idEstatusActivoFijo) || '').toUpperCase();
    if (estatus === 'DESCOMPUESTO') return 'danger';
    if (['EN REPARACIÓN', 'REPARADO', 'POR INSTALAR'].includes(estatus)) return 'admin';
    if (estatus === 'NUEVO') return 'success';
    if (estatus === 'USADO') return 'warning';
    return 'neutral';
  }

  async eliminarActivoFijo(idActivoFijo: string): Promise<void> {
    await this.fixedAssetsService.delete(idActivoFijo);
    this.showMessage('success', 'Correcto', 'Eliminado correctamente');
  }

  cerrarModalActivoFijo(): void {
    this.mostrarModalActivoFijo = false;
    this.activoFijoSeleccionada = new ActivoFijo();
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerSucursales(): void {
    const sub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({
          ...item,
          id: item.id.toString(),
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    this.subscriptions.push(sub);
  }

  obtenerAreasActivosFijos(): void {
    const sub = this.areasFixedAssetsService.get().subscribe({
      next: (data) => {
        this.areasActivosFijos = data.map((item: any) => ({ ...item }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    this.subscriptions.push(sub);
  }

  obtenerCategoriasActivosFijos(): void {
    const sub = this.categoriesFixedAssetsService.get().subscribe({
      next: (data) => {
        this.categoriasActivosFijos = data.map((item: any) => ({ ...item }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    this.subscriptions.push(sub);
  }

  obtenerUbicacionesActivosFijos(): void {
    const sub = this.locationsFixedAssetsService.get().subscribe({
      next: (data) => {
        this.ubicacionesActivosFijos = data.map((item: any) => ({ ...item }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    this.subscriptions.push(sub);
  }

  obtenerEstatusActivosFijos(): void {
    const sub = this.statusFixedAssetsService.get().subscribe({
      next: (data) => {
        this.estatusActivosFijos = data.map((item: any) => ({ ...item }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    this.subscriptions.push(sub);
  }

  mostrarTickets = (activo: ActivoFijo): void => {
    this.mostrarModalTickets = true;
    this.activoFijoSeleccionada = activo;
  };

  filtrarActivosFijos(): void {
    this.activosFijosFiltrados = this.activosFijos.filter((activo) => {
      return (
        (!this.idSucursalFiltro || activo.idSucursal === this.idSucursalFiltro) &&
        (!this.idAreaFiltro || activo.idArea === this.idAreaFiltro) &&
        (!this.idLocacionFiltro || activo.idAreaActivoFijo === this.idLocacionFiltro) &&
        (!this.idCategoriaFiltro || activo.idCategoriaActivoFijo === this.idCategoriaFiltro) &&
        (!this.idEstatusFiltro || activo.idEstatusActivoFijo === this.idEstatusFiltro) &&
        (!this.idUbicacionFiltro || activo.idUbicacionActivoFijo === this.idUbicacionFiltro)
      );
    });
  }

  limpiarFiltros(): void {
    this.idSucursalFiltro = undefined;
    this.idAreaFiltro = undefined;
    this.idLocacionFiltro = undefined;
    this.idCategoriaFiltro = undefined;
    this.idEstatusFiltro = undefined;
    this.idUbicacionFiltro = undefined;
    this.textoBusquedaReferencia = '';

    this.activosFijosFiltrados = this.activosFijos;
  }

  get hayFiltrosActivos(): boolean {
    return Boolean(
      this.idSucursalFiltro ||
      this.idAreaFiltro ||
      this.idLocacionFiltro ||
      this.idCategoriaFiltro ||
      this.idEstatusFiltro ||
      this.idUbicacionFiltro ||
      this.textoBusquedaReferencia.trim()
    );
  }

  get activosVisibles(): ActivoFijo[] {
    const texto = (this.textoBusquedaReferencia || '').toLowerCase().trim();
    if (!texto) return this.activosFijosFiltrados;

    return this.activosFijosFiltrados.filter((activo) => {
      const referencia = activo.referencia?.toLowerCase() || '';
      const noSerie = activo.noSerie?.toLowerCase() || '';
      return referencia.includes(texto) || noSerie.includes(texto);
    });
  }

  obtenerCostoTotalActivos(lista: ActivoFijo[]): number {
    return lista.reduce((total, activo) => total + (activo.costo || 0), 0);
  }

  get costoTotalFiltrado(): number {
    return this.obtenerCostoTotalActivos(this.activosVisibles);
  }

  get costoMantenimientosFiltrado(): number {
    return this.activosVisibles.reduce(
      (total, activo) => total + this.getCostoTotalMantenimientos(activo),
      0
    );
  }

  get totalCriticos(): number {
    return this.activosVisibles.filter((a) => this.obtenerTipoEstadoRow(a) === 'danger').length;
  }

  exportToExcel(filename: string = 'listado_activos.xlsx'): void {
    const datosExportar = this.transformarDatos();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activos');
    XLSX.writeFile(wb, filename);
  }

  private transformarDatos(): any[] {
    return this.activosVisibles.map((a) => ({
      REFERENCIA: a.referencia,
      DESCRIPCION: a.descripcion,
      SUCURSAL: this.nombreSucursal(a.idSucursal),
      AREA: this.nombreArea(a.idArea),
      LOCACION: this.nombreAreaActivoFijo(a.idAreaActivoFijo),
      CATEGORIA: this.nombreCategoriaActivoFijo(a.idCategoriaActivoFijo),
      '# MANT': a.mantenimientos?.length || 0,
      CONDICION: this.nombreEstatusActivoFijo(a.idEstatusActivoFijo),
      UBICACION: this.nombreUbicacionActivoFijo(a.idUbicacionActivoFijo),
      COSTO: a.costo,
      'COSTO MANT.': this.getCostoTotalMantenimientos(a),
    }));
  }

  nombreSucursal = (idSucursal: string) => this.sucursales.find((x) => x.id == idSucursal)?.nombre;
  nombreArea = (idArea: string) => this.areasService.areas.find((x) => x.id == idArea)?.nombre;
  nombreAreaActivoFijo = (idAreaActivoFijo: string) =>
    this.areasActivosFijos.find((x) => x.id == idAreaActivoFijo)?.nombre;
  nombreCategoriaActivoFijo = (idCategoriaActivoFijo: string) =>
    this.categoriasActivosFijos.find((x) => x.id == idCategoriaActivoFijo)?.nombre;
  nombreEstatusActivoFijo = (idEstatusActivoFijo: string) =>
    this.estatusActivosFijos.find((x) => x.id == idEstatusActivoFijo)?.nombre;
  nombreUbicacionActivoFijo = (idUbicacionActivoFijo: string) =>
    this.ubicacionesActivosFijos.find((x) => x.id == idUbicacionActivoFijo)?.nombre;
}
