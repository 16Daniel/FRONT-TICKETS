import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { AcordeonTicketsPorSucursalComponent } from '../../../tickets/components/acordeon-tickets-por-sucursal/acordeon-tickets-por-sucursal.component';
import { AcordeonTicketsPorUsuarioComponent } from '../../../tickets/components/acordeon-tickets-por-usuario/acordeon-tickets-por-usuario.component';
import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { IconosNotificacionesTicketsComponent } from '../../../tickets/components/iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { ComprasDialogComponent } from '../../../compras/dialogs/compras-dialog/compras-dialog.component';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { SolicitarCompraDialogComponent } from '../../../compras/dialogs/solicitar-compra-dialog/solicitar-compra-dialog.component';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';

import { AcordeonMantenimientosSistemasComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-sistemas/acordeon-mantenimientos-sistemas.component';
import { AcordeonMantenimientosAudioVideoComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-audio-video/acordeon-mantenimientos-audio-video.component';
import { AcordeonMantenimientosMantenimientoComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-mantenimiento/acordeon-mantenimientos-mantenimiento.component';

import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Compra } from '../../../compras/interfaces/compra.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';
import { MantenimientoAudioVideo } from '../../../mantenimientos/interfaces/mantenimiento-audio-video.interface';
import { MantenimientoMtto } from '../../../mantenimientos/interfaces/mantenimiento-mtto.interface';

import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { ComprasService } from '../../../compras/services/compras.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MantenimientosSistemasService } from '../../../mantenimientos/services/mantenimientos-sistemas.service';
import { MaintenanceAvService } from '../../../mantenimientos/services/maintenance-av.service';
import { MaintenanceMtooService } from '../../../mantenimientos/services/maintenance-mtto.service';
import { KpisTicketsService, KpisFiltros } from '../../services/kpis-tickets.service';
import { KpiRadarService } from '../../services/kpi-radar.service';
import { MatrizUrgenciaService } from '../../../categorias/services/matriz-urgencia.service';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';

@Component({
  selector: 'app-admin-area-tab',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    CrearTicketDialogComponent,
    HistorialTicketsDialogComponent,
    AcordeonTicketsPorSucursalComponent,
    AcordeonTicketsPorUsuarioComponent,
    DetalleTicketDialogComponent,
    IconosNotificacionesTicketsComponent,
    ComprasDialogComponent,
    SolicitarCompraDialogComponent,
    AcordeonMantenimientosSistemasComponent,
    AcordeonMantenimientosAudioVideoComponent,
    AcordeonMantenimientosMantenimientoComponent,
    TarjetaRendimientoSlaComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-area-tab.component.html',
  styleUrl: './admin-area-tab.component.scss'
})
export class AdminAreaTabComponent implements OnInit, OnDestroy {
  @Input() idArea!: string;
  @Input() areaName!: string;

  tickets: Ticket[] = [];
  todosLostickets: Ticket[] = [];
  ticket: Ticket | undefined;
  
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  compras: Compra[] = [];
  
  mantenimientosTI: MantenimientoSys[] = [];
  mantenimientosAV: MantenimientoAudioVideo[] = [];
  mantenimientosMtto: MantenimientoMtto[] = [];

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarAgrupacion: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalCompras: boolean = false;
  mostrarModalSolicitarCompra: boolean = false;

  mostrarMantenimientosTI = false;
  mostrarMantenimientosAV = false;
  mostrarMantenimientosMtto = false;
  
  auxMostrarMantenimientos = true;
  ordenarMantenimientosFecha: boolean = false;

  usuario: Usuario;
  sucursal: Sucursal | undefined;
  usergroup: Usuario | undefined;
  filtroActivo: 'slaAtencion' | 'slaResolucion' | 'desbloqueo' | 'panico' | null = null;

  subscripcionTicket: Subscription | undefined;

  // SLA general del área (mes actual, sin filtrar por usuario)
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
  private ticketsSlaMes: Ticket[] = [];
  private subscripcionSlaTickets?: Subscription;
  private subscripcionSlaMatriz?: Subscription;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private purchaseService: ComprasService,
    private datesHelper: DatesHelperService,
    private maintenanceSysService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
    private maintenanceMttoService: MaintenanceMtooService,
    private kpisTicketsService: KpisTicketsService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private kpiRadarService: KpiRadarService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  ngOnInit() {
    this.definirMesActual();
    this.obtenerTickets();
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
    this.obtenerCompras();
    this.cargarDatosSlaMes();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Trigger animations / re-renders if needed
      this.auxMostrarMantenimientos = false;
      this.cdr.detectChanges();
      this.auxMostrarMantenimientos = true;
      this.cdr.detectChanges();
    }, 1500);
  }

  ngOnDestroy() {
    if (this.subscripcionTicket) {
      this.subscripcionTicket.unsubscribe();
    }
    this.subscripcionSlaTickets?.unsubscribe();
    this.subscripcionSlaMatriz?.unsubscribe();
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
    this.loadingSla = true;
    const now = new Date();
    const fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const fechaFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Matriz de urgencia del área para evaluar los tiempos de SLA
    this.subscripcionSlaMatriz = this.matrizUrgenciaService.obtenerMatrizPorArea(this.idArea).subscribe({
      next: (matriz) => {
        this.matrizUrgenciaArea = matriz;
        this.consultarTicketsSlaMes(fechaInicio, fechaFin);
      },
      error: (err) => {
        console.error('Error al obtener matriz de urgencia:', err);
        this.consultarTicketsSlaMes(fechaInicio, fechaFin);
      }
    });
  }

  private consultarTicketsSlaMes(fechaInicio: Date, fechaFin: Date): void {
    const filtros: KpisFiltros = { fechaInicio, fechaFin };

    this.subscripcionSlaTickets?.unsubscribe();
    this.subscripcionSlaTickets = this.kpisTicketsService.getTicketsPorFiltros(this.idArea, filtros).subscribe({
      next: (tickets: Ticket[]) => {
        this.ticketsSlaMes = tickets || [];
        this.procesarMetricasSla();
        this.loadingSla = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener tickets del mes actual para el área:', err);
        this.loadingSla = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Misma regla que la vista del analista: responsable o involucrado (o toda el área si es guardia). */
  private filtrarTicketsSlaPorUsuario(tickets: Ticket[], user: Usuario): Ticket[] {
    const idUsuarioStr = String(user.id);

    return tickets.filter(t => {
      if (user.esGuardia) {
        return String(t.idArea) === String(user.idArea);
      }
      const esResponsable = String(t.idResponsable) === idUsuarioStr;
      const esEspecialista = String(t.idUsuarioEspecialista) === idUsuarioStr;
      const esInvolucrado = Array.isArray(t.idInvolucrados) &&
        t.idInvolucrados.map(String).includes(idUsuarioStr);
      return esResponsable || esEspecialista || esInvolucrado;
    });
  }

  get tituloSla(): string {
    return this.usergroup
      ? `Rendimiento de ${this.usergroup.nombre} ${this.usergroup.apellidoP}`
      : 'Rendimiento general del mes';
  }

  private procesarMetricasSla(): void {
    // Sin usuario agrupado: métricas generales del área.
    // Con usuario agrupado: solo los tickets donde participa ese usuario.
    const tickets = this.usergroup
      ? this.filtrarTicketsSlaPorUsuario(this.ticketsSlaMes, this.usergroup)
      : this.ticketsSlaMes;

    const totalTickets = tickets.length;
    const terminados = tickets.filter(t => String(t.idEstatusTicket) === '3');
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

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async obtenerTickets(): Promise<void> {
    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: { container: 'swal-topmost' }
    });

    this.subscripcionTicket = this.ticketsService.getByArea(this.idArea).subscribe({
      next: (data) => {
        this.tickets = data;
        this.tickets.sort((a, b) => {
          const scoreA = (a as any).score || (((a as any).criticidad && (a as any).urgencia) ? (a as any).criticidad * (a as any).urgencia : 4);
          const scoreB = (b as any).score || (((b as any).criticidad && (b as any).urgencia) ? (b as any).criticidad * (b as any).urgencia : 4);
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          const timeA = a.fecha?.toDate ? a.fecha.toDate().getTime() : (a.fecha ? new Date(a.fecha).getTime() : 0);
          const timeB = b.fecha?.toDate ? b.fecha.toDate().getTime() : (b.fecha ? new Date(b.fecha).getTime() : 0);
          return timeB - timeA;
        });

        if (this.ticket != undefined) {
          let temp = this.tickets.filter((x) => x.id == this.ticket!.id);
          if (temp.length > 0) {
            this.ticket = temp[0];
          }
        }

        this.todosLostickets = this.tickets.filter(x => x.validacionAdmin != true).map((item: any) => ({
          ...item,
          idCategoria: item.idCategoria ? item.idCategoria.toString() : item.idCategoria
        }));

        this.aplicarFiltrosVista();
        this.cdr.detectChanges();
        setTimeout(() => { Swal.close(); }, 1000);
      },
      error: (error) => {
        console.error('Error al escuchar los tickets:', error);
        Swal.close();
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;

        if (this.idArea === '1' || this.idArea === '2') {
          // TI
          this.maintenanceSysService.getUltimosMantenimientos(this.sucursales.map(s => s.id)).subscribe((result) => {
            let filtered = result.filter(e => e.length > 0);
            this.mantenimientosTI = [];
            for (let itemdata of filtered) {
              for (let item of itemdata) this.mantenimientosTI.push(item);
            }
            this.mantenimientosTI = this.mantenimientosTI.map(x => { x.fecha = this.datesHelper.getDate(x.fecha); return x; });
            this.cdr.detectChanges();
          });

          // AV
          this.maintenanceAvService.getUltimosMantenimientos(this.sucursales.map(s => s.id)).subscribe((result) => {
            let filtered = result.filter(e => e.length > 0);
            this.mantenimientosAV = [];
            for (let itemdata of filtered) {
              for (let item of itemdata) this.mantenimientosAV.push(item);
            }
            this.mantenimientosAV = this.mantenimientosAV.map(x => { x.fecha = this.datesHelper.getDate(x.fecha); return x; });
            this.cdr.detectChanges();
          });
        }

        if (this.idArea === '4') {
          // Mtto
          this.maintenanceMttoService.getUltimosMantenimientos(this.sucursales.map(s => s.id)).subscribe((result) => {
            let filtered = result.filter(e => e.length > 0);
            this.mantenimientosMtto = [];
            for (let itemdata of filtered) {
              for (let item of itemdata) this.mantenimientosMtto.push(item);
            }
            this.mantenimientosMtto = this.mantenimientosMtto.map(x => { x.fecha = this.datesHelper.getDate(x.fecha); return x; });
            this.cdr.detectChanges();
          });
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerUsuariosHelp() {
    this.usersService.getUsuariosPorRol(['4', '7'], this.idArea)
      .subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerCompras() {
    this.purchaseService.getByArea(this.idArea).subscribe(result => {
      this.compras = result;
    });
  }

  agrupar(user: Usuario) {
    this.usergroup = user;
    this.mostrarAgrupacion = true;
    this.aplicarFiltrosVista();
    this.procesarMetricasSla();
    this.cdr.detectChanges();
  }

  agruparPorSucursal() {
    this.usergroup = undefined;
    this.mostrarAgrupacion = true;
    this.aplicarFiltrosVista();
    this.procesarMetricasSla();
    this.cdr.detectChanges();
  }

  aplicarFiltroRapido(filtro: 'slaAtencion' | 'slaResolucion' | 'desbloqueo' | 'panico' | null) {
    this.filtroActivo = this.filtroActivo === filtro ? null : filtro;
    this.aplicarFiltrosVista();
    this.cdr.detectChanges();
  }

  private aplicarFiltrosVista(): void {
    let lista = [...this.todosLostickets];

    if (this.usergroup?.idRol === '7') {
      lista = lista.filter(x => x.idUsuarioEspecialista == this.usergroup!.id);
    }

    if (this.filtroActivo === 'slaAtencion') {
      lista = lista.filter(t => this.tieneSlaAtencionVencido(t));
    } else if (this.filtroActivo === 'slaResolucion') {
      lista = lista.filter(t => this.tieneSlaResolucionVencido(t));
    } else if (this.filtroActivo === 'desbloqueo') {
      lista = lista.filter(t => t.revisionDesbloqueo === true);
    } else if (this.filtroActivo === 'panico') {
      lista = lista.filter(t => Number(t.score) > 8);
    }

    this.tickets = lista;
  }

  private obtenerHorasUrgenciaSla(t: Ticket): number {
    if (t.horasAtencion && t.horasAtencion > 0) {
      return t.horasAtencion;
    }
    const impacto = Math.min(3, Math.max(1, t.criticidad || 2));
    const urgencia = Math.min(3, Math.max(1, t.urgencia || 2));
    const celda = this.matrizUrgenciaService.obtenerCelda(this.matrizUrgenciaArea, impacto, urgencia);
    return celda?.horas ?? 24;
  }

  private tieneSlaAtencionVencido(t: Ticket): boolean {
    const fechaCreacion = t.fecha?.toDate ? t.fecha.toDate() : (t.fecha ? this.datesHelper.getDate(t.fecha) : new Date());
    const fechaAtencion = t.fechaAtencion
      ? (t.fechaAtencion?.toDate ? t.fechaAtencion.toDate() : this.datesHelper.getDate(t.fechaAtencion))
      : null;
    const horasUrgenciaSla = this.obtenerHorasUrgenciaSla(t);
    const refFin = fechaAtencion || new Date();
    const horasTranscurridas = Math.max(0, refFin.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60);
    return horasTranscurridas > horasUrgenciaSla;
  }

  private tieneSlaResolucionVencido(t: Ticket): boolean {
    const fechaAtencion = t.fechaAtencion
      ? (t.fechaAtencion?.toDate ? t.fechaAtencion.toDate() : this.datesHelper.getDate(t.fechaAtencion))
      : null;
    if (!fechaAtencion) return false;

    let horasResolucionSla = 24;
    if (t.horasResolucion && t.horasResolucion > 0) {
      horasResolucionSla = t.horasResolucion;
    } else if (t.tiempoResolucion && t.tiempoResolucion > 0) {
      const u = t.unidadResolucion || 'h';
      horasResolucionSla = u === 'm' ? t.tiempoResolucion / 60 : (u === 'd' ? t.tiempoResolucion * 24 : t.tiempoResolucion);
    } else {
      horasResolucionSla = this.obtenerHorasUrgenciaSla(t) || 24;
    }

    const fechaFin = t.fechaFin
      ? (t.fechaFin?.toDate ? t.fechaFin.toDate() : this.datesHelper.getDate(t.fechaFin))
      : null;
    const refFin = fechaFin || new Date();
    const horasTranscurridas = Math.max(0, refFin.getTime() - fechaAtencion.getTime()) / (1000 * 60 * 60);
    return horasTranscurridas > horasResolucionSla;
  }

  abrirModalDetalleTicket(itemticket: Ticket | any) {
    this.mostrarModalTicketDetail = true;
    this.ticket = itemticket;
  }

  sucursalesMantenimeintosActivos(areaIdToCheck: string) {
    if (this.usergroup !== undefined) {
      const idsSucursalesUsuario = this.usergroup?.sucursales.map(s => String(s.id));
      return this.sucursales.filter(sucursal =>
        idsSucursalesUsuario?.includes(String(sucursal.id)) &&
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes(areaIdToCheck)
      );
    } else {
      return this.sucursales.filter(sucursal =>
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes(areaIdToCheck)
      );
    }
  }
}
