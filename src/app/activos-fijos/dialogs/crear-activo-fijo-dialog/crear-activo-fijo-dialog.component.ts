import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { Area } from '../../../areas/models/area.model';
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
  selector: 'app-crear-activo-fijo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule],
  templateUrl: './crear-activo-fijo-dialog.component.html',
  styleUrl: './crear-activo-fijo-dialog.component.scss',
})
export class CrearActivoFijoDialogComponent implements OnInit, OnDestroy {
  @Input() mostrarModalCrearActivoFijo: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() activoFijo: ActivoFijo | any;
  @Input() esNuevoActivoFijo: boolean = true;

  idActivoFijoEditar: string = '';
  usuario: Usuario;
  guardando: boolean = false;

  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  areasActivosFijos: AreaActivoFijo[] = [];
  categoriasActivosFijos: CategoriaActivoFijo[] = [];
  ubicacionesActivosFijos: UbicacionActivoFijo[] = [];
  estatusActivosFijos: EstatusActivoFijo[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private fixedAssetsService: ActivosFijosService,
    private branchesService: SucursalesService,
    private areasService: AreasService,
    private areasFixedAssetsService: AreasActivosFijosService,
    private categoriesFixedAssetsService: CategoriasActivosFijosService,
    private statusFixedAssetsService: EstatusActivosFijosService,
    private locationsFixedAssetsService: UbicacionesActivosFijosService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    if (!this.esNuevoActivoFijo) {
      this.idActivoFijoEditar = this.activoFijo.id;
    }

    this.areas = this.areasService.areas;
    this.obtenerSucursales();
    this.obtenerAreasActivosFijos();
    this.obtenerCategoriasActivosFijos();
    this.obtenerUbicacionesActivosFijos();
    this.obtenerEstatusActivosFijos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onHide = (): void => this.closeEvent.emit(false);

  async enviar(form: NgForm): Promise<void> {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    if (this.guardando) return;
    this.esNuevoActivoFijo ? await this.crear() : await this.actualizar();
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

    this.activoFijo.consecutivo = await this.fixedAssetsService.obtenerSecuencial(
      this.activoFijo.idArea,
      this.activoFijo.idSucursal,
      this.activoFijo.idAreaActivoFijo,
      this.activoFijo.idCategoriaActivoFijo
    );

    const sucursal = this.rellenarCeros(this.activoFijo.idSucursal, 2);
    const area =
      this.areas.find((x) => x.id == this.activoFijo.idArea)?.nombre.substring(0, 1).toUpperCase() || '';
    const areaActivo =
      this.areasActivosFijos.find((x) => x.id == this.activoFijo.idAreaActivoFijo)?.alias || '';
    const categoriaActivo =
      this.categoriasActivosFijos
        .find((x) => x.id == this.activoFijo.idCategoriaActivoFijo)
        ?.nombre.substring(0, 1)
        .toUpperCase() || '';

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
    const area =
      areas.find((x) => x.id == activoNuevo.idArea)?.nombre.substring(0, 1).toUpperCase() || '';
    const areaActivo =
      areasActivosFijos.find((x) => x.id == activoNuevo.idAreaActivoFijo)?.alias || '';
    const categoria =
      categoriasActivosFijos
        .find((x) => x.id == activoNuevo.idCategoriaActivoFijo)
        ?.nombre.substring(0, 1)
        .toUpperCase() || '';

    const referenciaBaseGenerada = `RW${sucursal}${area}${areaActivo}${categoria}`;
    const referenciaActualBase = referenciaActual.substring(0, referenciaBaseGenerada.length);

    return referenciaBaseGenerada !== referenciaActualBase;
  }

  private rellenarCeros(numero: number, longitud: number): string {
    return numero.toString().padStart(longitud, '0');
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear(): Promise<void> {
    this.guardando = true;
    this.cdr.detectChanges();
    try {
      this.activoFijo.referencia = await this.crearReferencia();
      const referenciaExiste = await this.fixedAssetsService.getByReferencePromise(
        this.activoFijo.referencia
      );

      if (referenciaExiste) {
        this.showMessage('error', 'Error', 'La referencia ya existe: ' + this.activoFijo.referencia);
        return;
      }

      await this.fixedAssetsService.create({ ...this.activoFijo });
      this.closeEvent.emit(false);
      this.showMessage(
        'success',
        'Correcto',
        'Guardado correctamente con referencia ' + this.activoFijo.referencia
      );
    } catch (error: any) {
      this.showMessage('error', 'Error', error?.message || 'Error al guardar el activo fijo');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async actualizar(): Promise<void> {
    this.guardando = true;
    this.cdr.detectChanges();
    try {
      await this.fixedAssetsService.update(this.activoFijo, this.idActivoFijoEditar);
      this.closeEvent.emit(false);
      this.showMessage(
        'success',
        'Correcto',
        'Actualizado correctamente con referencia ' + this.activoFijo.referencia
      );
    } catch (error) {
      console.error('Error al actualizar el activo fijo:', error);
      this.showMessage('error', 'Error', 'Error al actualizar el activo fijo');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  obtenerSucursales(): void {
    const sub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({
          ...item,
          id: item.id.toString(),
        }));

        this.activoFijo.idSucursal = this.esNuevoActivoFijo
          ? this.usuario.idSucursal
            ? String(this.usuario.idSucursal)
            : ''
          : this.activoFijo.idSucursal;
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

        this.activoFijo.idArea = this.esNuevoActivoFijo
          ? parseInt(this.usuario.idArea).toString()
          : this.activoFijo.idArea;

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
}
