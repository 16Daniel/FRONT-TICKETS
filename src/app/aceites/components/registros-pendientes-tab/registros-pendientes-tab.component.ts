import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { AceiteService } from '../../services/aceite.service';
import { EntregaAceite } from '../../models/aceite.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

export type SubTabPendientesId = 'ACEITE' | 'TRAMPA';

@Component({
  selector: 'app-registros-pendientes-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    MultiSelectModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './registros-pendientes-tab.component.html',
  styleUrl: './registros-pendientes-tab.component.scss',
})
export class RegistrosPendientesTabComponent implements OnInit, OnDestroy {
  usuario: Usuario;
  public entregas: EntregaAceite[] = [];
  public entregasTodo: EntregaAceite[] = [];
  public entregasTA: EntregaAceite[] = [];
  public entregasTodoTA: EntregaAceite[] = [];
  @Input() sucursales: Sucursal[] = [];
  sucursalesSel: Sucursal[] = [];

  public tabActivo: SubTabPendientesId = 'ACEITE';
  private loadingAceite: boolean = false;
  private loadingTA: boolean = false;
  private loadingAccion: boolean = false;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  get loading(): boolean {
    return this.loadingAceite || this.loadingTA || this.loadingAccion;
  }

  get totalPorValidar(): number {
    const aceite = this.entregas.filter(x => x.comentariosCedis == null).length;
    const trampa = this.entregasTA.filter(x => x.comentariosCedis == null).length;
    return aceite + trampa;
  }

  get totalRechazados(): number {
    const aceite = this.entregas.filter(x => x.comentariosCedis != null).length;
    const trampa = this.entregasTA.filter(x => x.comentariosCedis != null).length;
    return aceite + trampa;
  }

  constructor(
    public aceiteService: AceiteService,
    public cdr: ChangeDetectorRef,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.sucursales = this.sucursales.filter(x => x.idFront);
    this.sucursalesSel = [...this.sucursales];
    this.consultarEntregas();
    this.consultarEntregasTA();
    this.refreshIntervalId = setInterval(() => {
      this.consultarEntregas();
      this.consultarEntregasTA();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  seleccionarTab(tab: SubTabPendientesId): void {
    this.tabActivo = tab;
  }

  consultarEntregas(): void {
    this.loadingAceite = true;
    this.aceiteService.getEntregasAdmin().subscribe({
      next: (data) => {
        this.entregas = data;
        this.loadingAceite = false;
        this.entregasTodo = [...data];
        this.filtrar();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loadingAceite = false;
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  consultarEntregasTA(): void {
    this.loadingTA = true;
    this.aceiteService.getEntregasAdminTA().subscribe({
      next: (data) => {
        this.entregasTA = data;
        this.loadingTA = false;
        this.entregasTodoTA = [...data];
        this.filtrar();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loadingTA = false;
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  obtenerNombreSucursal(idSucursal: number): string {
    const found = this.sucursales.find((x) => x.idFront == idSucursal);
    return found ? found.nombre : '';
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      const firestoreTimestamp = tsmp;
      return firestoreTimestamp.toDate();
    } catch {
      return tsmp;
    }
  }

  filtrar(): void {
    this.entregas = [];
    this.entregasTA = [];
    for (const item of this.sucursalesSel) {
      const data = this.entregasTodo.filter(x => x.idSucursal == item.idFront!);
      const dataTA = this.entregasTodoTA.filter(x => x.idSucursal == item.idFront!);
      this.entregas.push(...data);
      this.entregasTA.push(...dataTA);
    }
  }

  confirmarEliminacion(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este registro pendiente de aceite será eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminar(id);
      }
    });
  }

  eliminar(id: number): void {
    this.loadingAccion = true;
    this.aceiteService.eliminarEntrega(id).subscribe({
      next: () => {
        this.loadingAccion = false;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Eliminado correctamente',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            container: 'swal-topmost',
          },
        });
        this.consultarEntregas();
      },
      error: (error) => {
        this.loadingAccion = false;
        console.log(error);
      },
    });
  }

  confirmarEliminacionTA(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este registro pendiente de trampa de grasa será eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarTA(id);
      }
    });
  }

  eliminarTA(id: number): void {
    this.loadingAccion = true;
    this.aceiteService.eliminarEntregaTA(id).subscribe({
      next: () => {
        this.loadingAccion = false;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Eliminado correctamente',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            container: 'swal-topmost',
          },
        });
        this.consultarEntregasTA();
      },
      error: (error) => {
        this.loadingAccion = false;
        console.log(error);
      },
    });
  }
}
