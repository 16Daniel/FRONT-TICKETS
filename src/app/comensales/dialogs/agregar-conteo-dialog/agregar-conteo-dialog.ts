import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { ConteoComensales } from '../../interfaces/conteo-comensales.interface';
import { sucursalCompetencia } from '../../interfaces/sucursal-competencia.interface';
import { sucursalesComensales } from '../../models/sucursales-comensales.model';
import { ComensalesService } from '../../services/comensales.service';

@Component({
  selector: 'app-agregar-conteo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
    CalendarModule,
    MultiSelectModule,
    DropdownModule,
    InputSwitchModule,
    TooltipModule,
  ],
  templateUrl: './agregar-conteo-dialog.html',
  styleUrl: './agregar-conteo-dialog.scss',
})
export class AgregarConteoDialog implements OnInit, OnDestroy {
  @Input() verModalAgregarConteo: boolean = false;
  @Input() arr_turnos: any[] = [];
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() itemConteo: ConteoComensales | undefined;

  public sucursalesrw: sucursalesComensales[] = [];
  public sucursalescompetencia: sucursalesComensales[] = [];
  public versucursalescompetencia: boolean = false;
  public arr_competencia: sucursalCompetencia[] = [];

  public formMesasRW: number | undefined;
  public formComensalesRW: number | undefined;
  public formMesasCompetencia: number | undefined;
  public formComensalesCompetencia: number | undefined;
  public sucursaleSelRW: sucursalesComensales | undefined;
  public sucursaleSelCompetencia: sucursalesComensales | undefined;

  usuario: Usuario;
  public turnoSel: any;
  public guardando: boolean = false;

  private branchesSub?: Subscription;
  private competenciaSub?: Subscription;

  constructor(
    public comensalesService: ComensalesService,
    public cdr: ChangeDetectorRef,
    private branchesService: SucursalesService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerSucursalesCompetencia();

    if (this.itemConteo != undefined) {
      this.formComensalesRW = this.itemConteo.comensales;
      this.formMesasRW = this.itemConteo.mesas;
      this.arr_competencia = (this.itemConteo.competencia || []).map((c) => ({ ...c }));
      this.sucursaleSelRW = this.itemConteo.sucursal ? { ...this.itemConteo.sucursal } : undefined;
      const temp = this.arr_turnos.find((x) => x.id == this.itemConteo!.turno);
      this.turnoSel = temp ?? undefined;
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.branchesSub?.unsubscribe();
    this.competenciaSub?.unsubscribe();
  }

  get formularioValido(): boolean {
    return (
      this.turnoSel != undefined &&
      this.sucursaleSelRW != undefined &&
      this.formMesasRW != undefined &&
      this.formComensalesRW != undefined
    );
  }

  get puedeAgregarCompetencia(): boolean {
    return (
      this.sucursaleSelCompetencia != undefined &&
      this.formMesasCompetencia != undefined &&
      this.formComensalesCompetencia != undefined
    );
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  obtenerSucursales(): void {
    this.branchesSub?.unsubscribe();
    this.branchesSub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursalesrw = data.map((item) => ({
          id: item.id!,
          nombre: item.nombre,
        }));

        if (this.itemConteo == undefined) {
          const idSucursal = this.usuario?.idSucursal;
          if (idSucursal) {
            const match = this.sucursalesrw.find((x) => String(x.id) == String(idSucursal));
            if (match) {
              this.sucursaleSelRW = match;
            }
          }
        } else if (this.sucursaleSelRW?.id) {
          const match = this.sucursalesrw.find(
            (x) => String(x.id) == String(this.sucursaleSelRW?.id)
          );
          if (match) {
            this.sucursaleSelRW = match;
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener sucursales:', error);
      },
    });
  }

  obtenerSucursalesCompetencia(): void {
    this.competenciaSub?.unsubscribe();
    this.competenciaSub = this.comensalesService.obtenerSucursales().subscribe({
      next: (data) => {
        this.sucursalescompetencia = data.map((item) => ({
          id: item.id!,
          nombre: item.nombre,
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener sucursales de competencia:', error);
      },
    });
  }

  agregarCompetencia(): void {
    if (!this.puedeAgregarCompetencia) return;

    const yaExiste = this.arr_competencia.some(
      (x) => x.id == this.sucursaleSelCompetencia!.id!
    );

    if (!yaExiste) {
      const data: sucursalCompetencia = {
        id: this.sucursaleSelCompetencia!.id!,
        nombre: this.sucursaleSelCompetencia!.nombre,
        mesas: this.formMesasCompetencia!,
        comensales: this.formComensalesCompetencia!,
      };
      this.arr_competencia = [...this.arr_competencia, data];

      this.sucursaleSelCompetencia = undefined;
      this.formMesasCompetencia = undefined;
      this.formComensalesCompetencia = undefined;
      this.cdr.detectChanges();
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Sucursal ya agregada',
        text: 'Esta sucursal de competencia ya está en el comparativo.',
        confirmButtonColor: '#D3152A',
        customClass: { container: 'swal-topmost' },
      });
    }
  }

  eliminarCompetencia(index: number): void {
    this.arr_competencia.splice(index, 1);
    this.arr_competencia = [...this.arr_competencia];
    this.cdr.detectChanges();
  }

  async agregarConteo(): Promise<void> {
    if (!this.formularioValido || this.guardando) return;
    this.guardando = true;
    this.cdr.detectChanges();

    const data: ConteoComensales = {
      fecha: Timestamp.fromDate(new Date()),
      sucursal: this.sucursaleSelRW!,
      idSucursal: this.sucursaleSelRW!.id!,
      competencia: this.arr_competencia,
      mesas: this.formMesasRW!,
      comensales: this.formComensalesRW!,
      turno: this.turnoSel.id,
    };

    try {
      await this.comensalesService.agregarconteo(data);
      Swal.fire({
        title: 'Guardado',
        text: 'El conteo se registró correctamente.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
        customClass: { container: 'swal-topmost' },
      });
      this.onHide();
    } catch (error) {
      console.error('Error al agregar conteo:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el conteo.',
        icon: 'error',
        customClass: { container: 'swal-topmost' },
      });
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  getDtae(item: Timestamp): Date {
    return item.toDate();
  }

  async actualizarConteo(): Promise<void> {
    if (!this.formularioValido || this.guardando || !this.itemConteo) return;
    this.guardando = true;
    this.cdr.detectChanges();

    this.itemConteo.mesas = this.formMesasRW!;
    this.itemConteo.comensales = this.formComensalesRW!;
    this.itemConteo.competencia = this.arr_competencia;
    this.itemConteo.sucursal = this.sucursaleSelRW!;
    this.itemConteo.idSucursal = this.sucursaleSelRW!.id!;
    this.itemConteo.turno = this.turnoSel.id;

    try {
      await this.comensalesService.actualizarConteo(this.itemConteo, this.itemConteo.id!);
      Swal.fire({
        title: 'Actualizado',
        text: 'El conteo se actualizó correctamente.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
        customClass: { container: 'swal-topmost' },
      });
      this.onHide();
    } catch (error) {
      console.error('Error al actualizar conteo:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el conteo.',
        icon: 'error',
        customClass: { container: 'swal-topmost' },
      });
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
}
