import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { AcordeonTicketsPorPrioridadComponent } from '../../../tickets/components/acordeon-tickets-por-prioridad/acordeon-tickets-por-prioridad.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';
import { IconosNotificacionesTicketsComponent } from '../iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { KpisTicketsService } from '../../services/kpis-tickets.service';
import { MatrizUrgenciaService } from '../../../categorias/services/matriz-urgencia.service';
import { KpiRadarService } from '../../services/kpi-radar.service';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';

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
    AcordeonTicketsPorPrioridadComponent,
    FormsModule,
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
  mostrarTPVs: boolean = false;

  sucursal: Sucursal | undefined;
  usuario: Usuario;
  ticket: Ticket | undefined;

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
    private confirmationService: ConfirmationService,
    private kpisTicketsService: KpisTicketsService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private kpiRadarService: KpiRadarService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  ngOnInit() {
    this.definirMesActual();
    this.cargarDatosSlaMes();
  }

  ngOnDestroy(): void {
    this.subscripcionSlaTickets?.unsubscribe();
    this.subscripcionSlaMatriz?.unsubscribe();
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
