import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { ActivoFijo } from '../../../../models/activo-fijo.model';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { Usuario } from '../../../../models/usuario.model';
import { Area } from '../../../../models/area.model';
import { DropdownModule } from 'primeng/dropdown';
import { Sucursal } from '../../../../models/sucursal.model';
import { BranchesService } from '../../../../services/branches.service';
import { AreasService } from '../../../../services/areas.service';
import { AreasFixedAssetsService } from '../../../../services/areas-fixed-assets.service';
import { CategoriesFixedAssetsService } from '../../../../services/categories-activos-fijos.service';
import { AreaActivoFijo } from '../../../../models/area-activo-fijo.model';
import { CategoriaActivoFijo } from '../../../../models/categoria-activo-fijo.model';
import { UbicacionActivoFijo } from '../../../../models/ubicacion-activo-fijo.model';
import { EstatusActivoFijo } from '../../../../models/estatus-activo-fijo.model';
import { StatusFixedAssetsService } from '../../../../services/status-fixed-assets.service';
import { LocationsFixedAssetsService } from '../../../../services/locations-fixed-assets.service';

@Component({
  selector: 'app-modal-fixed-assets-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule],
  templateUrl: './modal-fixed-assets-create.component.html',
  styleUrl: './modal-fixed-assets-create.component.scss'
})

export class ModalFixedAssetsCreateComponent implements OnInit {
  @Input() mostrarModalCrearActivoFijo: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() activoFijo: ActivoFijo | any;
  @Input() esNuevoActivoFijo: boolean = true;
  idActivoFijoEditar: string = '';
  usuario: Usuario;

  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  areasActivosFijos: AreaActivoFijo[] = [];
  categoriasActivosFijos: CategoriaActivoFijo[] = [];
  ubicacionesActivosFijos: UbicacionActivoFijo[] = [];
  estatusActivosFijos: EstatusActivoFijo[] = [];

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private fixedAssetsService: FixedAssetsService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private areasFixedAssetsService: AreasFixedAssetsService,
    private categoriesFixedAssetsService: CategoriesFixedAssetsService,
    private statusFixedAssetsService: StatusFixedAssetsService,
    private locationsFixedAssetsService: LocationsFixedAssetsService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit() {
    if (!this.esNuevoActivoFijo) {
      this.idActivoFijoEditar = this.activoFijo.id;
    }

    this.obtenerSucursales();
    this.obtenerAreas();
    this.obtenerAreasActivosFijos();
    this.obtenerCategoriasActivosFijos();
    this.obtenerUbicacionesActivosFijos();
    this.obtenerEstatusActivosFijos();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    this.esNuevoActivoFijo ? this.crear() : this.actualizar();
  }

  async crearReferencia(): Promise<string> {
    if (this.activoFijo.referencia) {
      if (!this.activoFijo.referenciasAnteriores) {
        this.activoFijo.referenciasAnteriores = [];
      }

      if (!this.activoFijo.referenciasAnteriores.includes(this.activoFijo.referencia)) {
        this.activoFijo.referenciasAnteriores.push(this.activoFijo.referencia);
      }
    }

    this.activoFijo.consecutivo = await this.fixedAssetsService
      .obtenerSecuencial(
        this.activoFijo.idArea,
        this.activoFijo.idSucursal,
        this.activoFijo.idAreaActivoFijo,
        this.activoFijo.idCategoriaActivoFijo
      );

    const sucursal = this.rellenarCeros(this.activoFijo.idSucursal, 2);
    const area = this.areas.find(x => x.id == this.activoFijo.idArea)?.nombre.substring(0, 1).toUpperCase() || '';
    const areaActivo = this.areasActivosFijos.find(x => x.id == this.activoFijo.idAreaActivoFijo)?.alias || '';
    const categoriaActivo = this.categoriasActivosFijos.find(x => x.id == this.activoFijo.idCategoriaActivoFijo)?.nombre.substring(0, 1).toUpperCase() || '';

    const nuevaReferencia = `RW${sucursal}${area}${areaActivo}${categoriaActivo}${this.activoFijo.consecutivo}`;

    this.activoFijo.referencia = nuevaReferencia;

    return nuevaReferencia;
  }

  requiereNuevaReferencia(
    activoNuevo: any,
    referenciaActual: string,
    areas: any[],
    areasActivosFijos: any[],
    categoriasActivosFijos: any[]
  ): boolean {

    const sucursal = this.rellenarCeros(activoNuevo.idSucursal, 2);
    const area = areas.find(x => x.id == activoNuevo.idArea)?.nombre.substring(0, 1).toUpperCase() || '';
    const areaActivo = areasActivosFijos.find(x => x.id == activoNuevo.idAreaActivoFijo)?.alias || '';
    const categoria = categoriasActivosFijos.find(x => x.id == activoNuevo.idCategoriaActivoFijo)?.nombre.substring(0, 1).toUpperCase() || '';

    const referenciaBaseGenerada = `RW${sucursal}${area}${areaActivo}${categoria}`;

    // Comparar solo el prefijo de la referencia actual (sin consecutivo)
    const referenciaActualBase = referenciaActual.substring(0, referenciaBaseGenerada.length);

    return referenciaBaseGenerada !== referenciaActualBase;
  }


  private rellenarCeros(numero: number, longitud: number): string {
    return numero.toString().padStart(longitud, '0');
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.activoFijo.referencia = await this.crearReferencia();
    const referenciaExiste = await this.fixedAssetsService.getByReferencePromise(this.activoFijo.referencia);

    if (referenciaExiste) {
      this.showMessage('error', 'Error', 'La referencia ya existe: ' + this.activoFijo.referencia);
    }
    else {
      try {
        await this.fixedAssetsService.create({ ...this.activoFijo });
        this.cdr.detectChanges();
        this.closeEvent.emit(false); // Cerrar modal
        this.showMessage('success', 'Success', 'Guardado correctamente con referencia ' + this.activoFijo.referencia);

      } catch (error: any) {
        this.showMessage('error', 'Error', error.message);
      }
    }
  }

  async actualizar() {

    if (this.requiereNuevaReferencia(
      this.activoFijo,
      this.activoFijo.referencia,
      this.areas,
      this.areasActivosFijos,
      this.categoriasActivosFijos
    )) {
      this.activoFijo.referencia = await this.crearReferencia();
    }

    this.fixedAssetsService
      .update(this.activoFijo, this.idActivoFijoEditar)
      .then(() => {
        this.cdr.detectChanges();
        this.closeEvent.emit(false); // Cerrar modal
        this.showMessage('success', 'Success', 'Enviado correctamente con referencia ' + this.activoFijo.referencia);
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));

        this.activoFijo.idSucursal = parseInt(this.usuario.sucursales[0].id).toString();
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
        this.activoFijo.idArea = this.usuario.idArea;
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
        }));;
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
        }));;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
}
