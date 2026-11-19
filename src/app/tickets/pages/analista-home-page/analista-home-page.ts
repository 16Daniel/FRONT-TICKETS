import { Component, type OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, of, Subscription } from 'rxjs';
import { TicketsTabComponent } from '../../components/tickets-tab/tickets-tab.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TotalesSlaDashboard } from '../../components/tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { TicketsService } from '../../services/tickets.service';
import { TicketsFiltros } from '../../interfaces/tickets-filtros.interface';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';
import { KpiRadarService } from '../../services/kpi-radar.service';
import { MatrizUrgencia } from '../../models/matriz-urgencia.model';
import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../../usuarios/models/usuario.model';

@Component({
  selector: 'app-analista-home-page',
  standalone: true,
  imports: [
    CommonModule,
    TicketsTabComponent,
    PageHeaderComponent
  ],
  templateUrl: './analista-home-page.html',
  styleUrl: './analista-home-page.scss'
})
export default class AnalistaHomePageComponent implements OnInit, OnDestroy {
  usuario!: Usuario;
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

  private subscripcionSla?: Subscription;

  constructor(
    private ticketsService: TicketsService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private kpiRadarService: KpiRadarService,
    private cdr: ChangeDetectorRef
  ) {
    const rawUserData = localStorage.getItem('rwuserdatatk');
    if (rawUserData) {
      try {
        this.usuario = JSON.parse(rawUserData);
      } catch (e) {
        console.error('Error al parsear usuario de localStorage:', e);
      }
    }
  }

  ngOnInit(): void {
    this.definirMesActual();
    this.cargarDatosSlaMes();
  }

  ngOnDestroy(): void {
    this.subscripcionSla?.unsubscribe();
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
    if (!this.usuario) return;

    this.loadingSla = true;
    const now = new Date();
    const fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const fechaFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const idArea = String(this.usuario.idArea || '1');
    const filtros: TicketsFiltros = { fechaInicio, fechaFin };

    const matriz$ = this.matrizUrgenciaService.obtenerMatrizPorArea(idArea).pipe(
      catchError((err) => {
        console.error('Error al obtener matriz de urgencia:', err);
        return of(undefined);
      })
    );

    const tickets$ = this.ticketsService.getTicketsPorFiltrosTiempoReal(idArea, filtros);

    this.subscripcionSla?.unsubscribe();
    this.subscripcionSla = combineLatest([matriz$, tickets$]).subscribe({
      next: ([matriz, tickets]) => {
        this.matrizUrgenciaArea = matriz;
        this.procesarMetricasSla(tickets || []);
        this.loadingSla = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al escuchar tickets del mes actual para analista:', err);
        this.loadingSla = false;
        this.cdr.detectChanges();
      }
    });
  }

  private procesarMetricasSla(tickets: Ticket[]): void {
    if (!this.usuario || !tickets) return;

    const idUsuarioStr = String(this.usuario.id);

    // Filtrar los tickets que corresponden al analista
    const ticketsAnalista = tickets.filter(t => {
      if (this.usuario.esGuardia) {
        return String(t.idArea) === String(this.usuario.idArea);
      }
      const esResponsable = String(t.idResponsable) === idUsuarioStr;
      const esInvolucrado = Array.isArray(t.idInvolucrados) &&
        t.idInvolucrados.map(String).includes(idUsuarioStr);
      return esResponsable || esInvolucrado;
    });

    const totalTickets = ticketsAnalista.length;
    const terminados = ticketsAnalista.filter(t => String(t.idEstatusTicket) === '3');
    const totalTerminados = terminados.length;

    let slaAtencionCumplidos = 0;
    let slaResolucionCumplidos = 0;

    terminados.forEach(t => {
      const evalSla = this.kpiRadarService.evaluarSlaTicket(t, this.matrizUrgenciaArea);
      if (evalSla.atencion) {
        slaAtencionCumplidos++;
      }
      if (evalSla.resolucion) {
        slaResolucionCumplidos++;
      }
    });

    const slaAtencion = totalTerminados > 0
      ? (slaAtencionCumplidos / totalTerminados) * 100
      : 0;

    const slaResolucion = totalTerminados > 0
      ? (slaResolucionCumplidos / totalTerminados) * 100
      : 0;

    this.totalesSla = {
      totalTickets,
      totalTerminados,
      slaAtencion,
      slaAtencionCumplidos,
      slaResolucion,
      slaResolucionCumplidos
    };
  }
}
