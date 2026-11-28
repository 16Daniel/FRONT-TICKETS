import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { ComensalesService } from '../../services/comensales.service';
import { ConteoComensales } from '../../interfaces/conteo-comensales.interface';
import { itemConteo } from '../../interfaces/item-conteo.interface';
import { sucursalesComensales } from '../../models/sucursales-comensales.model';
import { SucursalesDialog } from '../../dialogs/sucursales-dialog/sucursales-dialog';
import { AgregarConteoDialog } from '../../dialogs/agregar-conteo-dialog/agregar-conteo-dialog';
import { GraficaComensalesComponent } from '../../components/grafica-comensales/grafica-comensales.component';

@Component({
  selector: 'app-comensales-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    CalendarModule,
    MultiSelectModule,
    DropdownModule,
    TooltipModule,
    PageHeaderComponent,
    SucursalesDialog,
    AgregarConteoDialog,
    GraficaComensalesComponent,
  ],
  templateUrl: './comensales-page.html',
  styleUrl: './comensales-page.scss',
})
export class ComensalesPage implements OnInit, OnDestroy {
  verModalSucursales: boolean = false;
  verModalAgregarConteo: boolean = false;
  public fechaini: Date = new Date();
  public fechafin: Date = new Date();
  public sucursalesrw: sucursalesComensales[] = [];
  public sucursalescompetencia: sucursalesComensales[] = [];
  public sucursalSel: sucursalesComensales | undefined;

  public dataConteos: itemConteo[] = [];
  public arr_ortiginal: ConteoComensales[] = [];
  public itemConteo: ConteoComensales | undefined;

  public loading: boolean = false;
  public busquedaRealizada: boolean = false;
  public usuario: Usuario;
  public arr_turnos: { id: number; nombre: string }[] = [
    { id: 1, nombre: 'MATUTINO' },
    { id: 2, nombre: 'VESPERTINO' },
  ];
  public turnoSel: { id: number; nombre: string } | undefined;

  private branchesSub?: Subscription;
  private competenciaSub?: Subscription;
  private conteosSub?: Subscription;

  constructor(
    public comensalesService: ComensalesService,
    private branchesService: SucursalesService,
    public cdr: ChangeDetectorRef
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerSucursalesCompetencia();
  }

  ngOnDestroy(): void {
    this.branchesSub?.unsubscribe();
    this.competenciaSub?.unsubscribe();
    this.conteosSub?.unsubscribe();
  }

  get puedeAgregarConteo(): boolean {
    return this.usuario?.idArea == '15' || this.usuario?.idRol == '1';
  }

  get puedeGestionarCompetencia(): boolean {
    return this.usuario?.idArea == '1' || this.usuario?.idRol == '1';
  }

  get totalComensalesRW(): number {
    return this.dataConteos
      .filter((item) => item.id !== undefined)
      .reduce((acc, item) => acc + (Number(item.comensales) || 0), 0);
  }

  get totalMesasRW(): number {
    return this.dataConteos
      .filter((item) => item.id !== undefined)
      .reduce((acc, item) => acc + (Number(item.mesas) || 0), 0);
  }

  get totalComensalesCompetencia(): number {
    return this.dataConteos
      .filter((item) => item.id === undefined)
      .reduce((acc, item) => acc + (Number(item.comensales) || 0), 0);
  }

  get totalRegistrosRW(): number {
    return this.dataConteos.filter((item) => item.id !== undefined).length;
  }

  abrirModalSucursales(): void {
    this.verModalSucursales = true;
  }

  abrirModalAgregarConteo(): void {
    this.itemConteo = undefined;
    this.verModalAgregarConteo = true;
  }

  abrirmodalEditar(id: string): void {
    const item = this.arr_ortiginal.find((x) => x.id == id);
    this.itemConteo = item;
    this.verModalAgregarConteo = true;
  }

  filtrar(): void {
    if (!this.fechaini || !this.fechafin || !this.sucursalSel?.id) return;

    this.dataConteos = [];
    this.loading = true;
    this.busquedaRealizada = true;
    this.conteosSub?.unsubscribe();

    this.conteosSub = this.comensalesService
      .obtenerconteosEntrefechas(
        this.fechaini,
        this.fechafin,
        this.sucursalSel.id,
        this.turnoSel == undefined ? undefined : this.turnoSel.id
      )
      .subscribe({
        next: (data) => {
          this.arr_ortiginal = data;
          const filas: itemConteo[] = [];

          for (const item of data) {
            const nomturno = item.turno
              ? this.arr_turnos.find((x) => x.id == item.turno)?.nombre || ''
              : '';

            filas.push({
              id: item.sucursal.id!,
              fecha: item.fecha,
              sucursal: item.sucursal,
              nombreSuc: this.nombreDeSucursal(item.sucursal),
              mesas: item.mesas,
              comensales: item.comensales,
              idReg: item.id!,
              turno: nomturno,
            });

            for (const itemC of item.competencia || []) {
              const sucursalComp: sucursalesComensales = {
                id: itemC.id,
                nombre: itemC.nombre,
              };
              filas.push({
                id: undefined,
                fecha: item.fecha,
                sucursal: sucursalComp,
                nombreSuc: this.nombreDeSucursalCompetencia(sucursalComp),
                mesas: itemC.mesas,
                comensales: itemC.comensales,
                idReg: item.id!,
                turno: nomturno,
              });
            }
          }

          this.dataConteos = filas;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al consultar conteos de comensales:', error);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  getDate(item: Timestamp): Date {
    return item.toDate();
  }

  nombreDeSucursal(item: sucursalesComensales): string {
    const match = this.sucursalesrw.find((x) => x.id == item.id);
    return match ? match.nombre : item.nombre;
  }

  nombreDeSucursalCompetencia(item: sucursalesComensales): string {
    const match = this.sucursalescompetencia.find((x) => x.id == item.id);
    return match ? match.nombre : item.nombre;
  }

  confirmacionEliminar(id: string): void {
    Swal.fire({
      title: '¿Está segur@ que desea eliminar?',
      text: 'Se eliminará este conteo de comensales junto con sus comparativos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        container: 'swal-topmost',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.elimarConteo(id);
      }
    });
  }

  async elimarConteo(id: string): Promise<void> {
    await this.comensalesService.borrarConteo(id);
    Swal.fire({
      title: 'Eliminado',
      text: 'Conteo eliminado correctamente.',
      icon: 'success',
      timer: 1800,
      showConfirmButton: false,
      customClass: {
        container: 'swal-topmost',
      },
    });
  }

  obtenerSucursales(): void {
    this.branchesSub?.unsubscribe();
    this.branchesSub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursalesrw = data.map((item) => ({
          id: item.id!,
          nombre: item.nombre,
        }));

        const idSucursal = this.usuario?.idSucursal;
        if (idSucursal) {
          const match = this.sucursalesrw.find(
            (x) => String(x.id) == String(idSucursal)
          );
          if (match) {
            this.sucursalSel = match;
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
}
