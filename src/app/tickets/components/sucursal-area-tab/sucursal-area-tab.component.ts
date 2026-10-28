import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { AcordeonTicketsPorPrioridadComponent } from '../../../tickets/components/acordeon-tickets-por-prioridad/acordeon-tickets-por-prioridad.component';
import { ModalBranchRatingComponent } from '../../../tickets/components/modal-branch-rating/modal-branch-rating.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { ModalTenXtenMaintenanceCheckComponent } from '../../../mantenimientos/dialogs/systems/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../../mantenimientos/dialogs/systems/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';
import { CheckMantenimientoSisAvComponent } from '../../../mantenimientos/dialogs/sistemas-av/check-mantenimiento-sis-av-dialog/check-mantenimiento-sis-av-dialog.component';
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';
import { MantenimientoAudioVideo } from '../../../mantenimientos/interfaces/mantenimiento-audio-video.interface';
import { MantenimientosSistemasService } from '../../../mantenimientos/services/mantenimientos-sistemas.service';
import { HistorialMantenimeintoSysAvComponent } from "../../../mantenimientos/dialogs/sistemas-av/historial-mantenimiento-sys-av-dialog/historial-mantenimiento-sys-av-dialog.component";
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { MaintenanceAvService } from '../../../mantenimientos/services/maintenance-av.service';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';

import { MaintenanceMtooService } from '../../../mantenimientos/services/maintenance-mtto.service';
import { MantenimientoMtto } from '../../../mantenimientos/interfaces/mantenimiento-mtto.interface';
import { ModalMaintenanceMttoHistoryComponent } from '../../../mantenimientos/dialogs/manteinance/modal-maintenance-mtto-history/modal-maintenance-mtto-history.component';
import { ModalMateinanceMttoCheckComponent } from '../../../mantenimientos/dialogs/manteinance/modal-mateinance-mtto-check/modal-mateinance-mtto-check.component';
import { IconosNotificacionesTicketsComponent } from '../iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { KpisTicketsService } from '../../services/kpis-tickets.service';
import { MatrizUrgenciaService } from '../../../categorias/services/matriz-urgencia.service';
import { KpiRadarService } from '../../services/kpi-radar.service';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sucursal-area-tab',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    CrearTicketDialogComponent,
    DetalleTicketDialogComponent,
    HistorialTicketsDialogComponent,
    ModalTenXtenMaintenanceCheckComponent,
    ModalTenXtenMaintenanceHistoryComponent,
    AcordeonTicketsPorPrioridadComponent,
    ModalBranchRatingComponent,
    FormsModule,
    CheckMantenimientoSisAvComponent,
    HistorialMantenimeintoSysAvComponent,
    ModalMaintenanceMttoHistoryComponent,
    ModalMateinanceMttoCheckComponent,
    IconosNotificacionesTicketsComponent,
    TarjetaRendimientoSlaComponent
  ],
  templateUrl: './sucursal-area-tab.component.html',
  styleUrl: './sucursal-area-tab.component.scss',
})
export class SucursalAreaTabComponent implements OnInit, OnDestroy {
  @Input() idArea!: string;
  @Input() tickets: Ticket[] = [];
  @Input() todosLosTickets: Ticket[] = [];
  @Input() esEspectadorActivo: boolean = false;

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModalMtooTI: boolean = false;
  mostrarModalAV: boolean = false;
  mostrarModalManteinance: boolean = false;
  
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalHistorialMantenimientosAV: boolean = false;
  mostrarModalRating: boolean = false;
  mostrarTPVs: boolean = false;

  sucursal: Sucursal | undefined;
  usuario: Usuario;
  ticket: Ticket | undefined;
  
  // IT & AV
  mantenimientoActivo: MantenimientoSys | null = null;
  mantenimientoAVActivo: MantenimientoAudioVideo | null = null;
  // Mtto
  mantenimientosActivos: MantenimientoMtto[] = [];

  private unsubscribe!: () => void;
  private unsubscribeAV!: () => void;
  private unsubscribeMtto!: () => void;
  private subscripcionSlaTickets?: Subscription;
  private subscripcionSlaMatriz?: Subscription;

  // Rendimiento SLA del mes
  loadingSla: boolean = false;
  mesActualNombre: string = '';
  matrizUrgenciaArea?: MatrizUrgencia;
  totalesSla: TotalesSlaDashboard = {
    totalTickets: 0,
    totalTerminados: 0,
    slaAtencion: 0,
    slaAtencionCumplidos: 0,
    slaResolucion: 0,
    slaResolucionCumplidos: 0
  };

  constructor(
    public cdr: ChangeDetectorRef,
    private mantenimientosSistemasService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
    private maintenanceMtooService: MaintenanceMtooService,
    private confirmationService: ConfirmationService,
    private kpisTicketsService: KpisTicketsService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private kpiRadarService: KpiRadarService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  ngOnInit() {
    this.obtenerMantenimientoActivo();
    this.definirMesActual();
    this.cargarDatosSlaMes();
  }

  ngOnDestroy(): void {
    this.subscripcionSlaTickets?.unsubscribe();
    this.subscripcionSlaMatriz?.unsubscribe();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.unsubscribeAV) {
      this.unsubscribeAV();
    }
    if (this.unsubscribeMtto) {
      this.unsubscribeMtto();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['esEspectadorActivo']) {
      this.cdr.detectChanges();
    }
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.ticket = ticket;
    this.mostrarModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show');
      });
    }, 50);
  }

  async obtenerMantenimientoActivo() {
    if (this.idArea === '1' || this.idArea === '2') {
      this.unsubscribe = this.mantenimientosSistemasService.getMantenimientoActivo(
        this.sucursal?.id,
        (mantenimiento) => {
          this.mantenimientoActivo = mantenimiento;
          this.cdr.detectChanges();
        }
      );

      this.unsubscribeAV = this.maintenanceAvService.getMantenimientoActivo(
        this.sucursal?.id,
        (mantenimiento) => {
          this.mantenimientoAVActivo = mantenimiento;
          this.cdr.detectChanges();
        }
      );
    }
    
    if (this.idArea === '4') {
      this.unsubscribeMtto = this.maintenanceMtooService.getMantenimientosActivosPorFecha(
        this.sucursal?.id,
        (mantenimientos) => {
          this.mantenimientosActivos = mantenimientos;
          this.cdr.detectChanges();
        }
      );
    }
  }

  mostrarAlertaIT() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE SISTEMAS EN 8 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.mostrarModalMtooTI = true;
      },
      reject: () => { },
    });
  }

  mostrarAlertaAV() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE AUDIO Y VIDEO EN 6 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.mostrarModalAV = true;
      },
      reject: () => { },
    });
  }
  
  mostrarAlertaMtto() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO EN 8 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.mostrarModalManteinance = true;
      },
      reject: () => { },
    });
  }

  private definirMesActual(): void {
    const now = new Date();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.mesActualNombre = `${meses[now.getMonth()]} ${now.getFullYear()}`;
  }

  private cargarDatosSlaMes(): void {
    if (!this.usuario || !this.idArea) return;

    this.loadingSla = true;
    const now = new Date();
    const fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const fechaFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const idArea = String(this.idArea);

    this.subscripcionSlaMatriz = this.matrizUrgenciaService.obtenerMatrizPorArea(idArea).subscribe({
      next: (matriz) => {
        this.matrizUrgenciaArea = matriz;
        this.consultarTicketsMes(idArea, fechaInicio, fechaFin);
      },
      error: (err) => {
        console.error('Error al obtener matriz de urgencia:', err);
        this.consultarTicketsMes(idArea, fechaInicio, fechaFin);
      }
    });
  }

  private consultarTicketsMes(idArea: string, fechaInicio: Date, fechaFin: Date): void {
    const idSucursales = (this.usuario.sucursales || []).map((s: any) => String(s.id));

    this.subscripcionSlaTickets?.unsubscribe();
    this.subscripcionSlaTickets = this.kpisTicketsService
      .getTicketsPorFiltros(idArea, { fechaInicio, fechaFin, idSucursales })
      .subscribe({
        next: (tickets: Ticket[]) => {
          this.procesarMetricasSla(tickets);
          this.loadingSla = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener tickets del mes actual para sucursal:', err);
          this.loadingSla = false;
          this.cdr.detectChanges();
        }
      });
  }

  private procesarMetricasSla(tickets: Ticket[]): void {
    if (!tickets) return;

    const terminados = tickets.filter(t => String(t.idEstatusTicket) === '3');
    const totalTerminados = terminados.length;

    let slaAtencionCumplidos = 0;
    let slaResolucionCumplidos = 0;

    terminados.forEach(t => {
      const evalSla = this.kpiRadarService.evaluarSlaTicket(t, this.matrizUrgenciaArea);
      if (evalSla.atencion) slaAtencionCumplidos++;
      if (evalSla.resolucion) slaResolucionCumplidos++;
    });

    this.totalesSla = {
      totalTickets: tickets.length,
      totalTerminados,
      slaAtencion: totalTerminados > 0 ? (slaAtencionCumplidos / totalTerminados) * 100 : 0,
      slaAtencionCumplidos,
      slaResolucion: totalTerminados > 0 ? (slaResolucionCumplidos / totalTerminados) * 100 : 0,
      slaResolucionCumplidos
    };
  }

  verificarTicketsPorValidar(tickets: Ticket[]) {
    let result = tickets.filter(x => x.idEstatusTicket == '7');
    return result.length > 0;
  }

  onClickGenerarTicket() {
    if (this.verificarTicketsPorValidar(this.tickets)) {
      this.confirmationService.confirm({
        header: 'IMPORTANTE',
        message: `TIENES TICKETS PENDIENTES POR VALIDAR`,
        acceptLabel: 'Aceptar',
        acceptButtonStyleClass: 'btn bg-p-b p-3',
        rejectButtonStyleClass: 'btn btn-light me-3 p-3',
        rejectVisible: false,
        accept: () => {
        },
      });
    }
    else {
      this.mostrarModalGenerateTicket = true;
    }
  }
}
