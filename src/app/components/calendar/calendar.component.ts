import { ChangeDetectorRef, Component, Input, input, SimpleChanges, ViewChild, type OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Importar idioma español

import { VisitasService } from '../../services/visitas.service';
import { GuardiasService } from '../../services/guardias.service';
import { Usuario } from '../../models/usuario.model';
import { Ticket } from '../../models/ticket.model';
import ModalEventDetailComponent from "../../modals/calendar/modal-event-detail/modal-event-detail.component";
import { Sucursal } from '../../models/sucursal.model';
import { DocumentsService } from '../../services/documents.service';
import { ColorUsuario } from '../../models/color-usuario';
import { TicketsService } from '../../services/tickets.service';
import { SucursalProgramada } from '../../models/sucursal-programada.model';
import { BranchesService } from '../../services/branches.service';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { DatesHelperService } from '../../helpers/dates-helper.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalEventDetailComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})

export class CalendarComponent implements OnInit {
  @Input() usuariosHelp: Usuario[] = [];
  @Input() idUsuarioFiltro: string = '';
  @Input() tickets: Ticket[] = [];
  sucursales: Sucursal[] = [];

  comentario: string = '';
  sucursalSeleccionada: SucursalProgramada | any;
  FechaSeleccionada: Date = new Date();
  showModalEventeDetail: boolean = false;
  colores: ColorUsuario[] = [];
  usuario: Usuario;
  usuarioSeleccionado: Usuario | any;

  @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;
  loading: boolean = false;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today', // Botones de navegación
      center: 'title', // Título del calendario
      right: '', // Botones para cambiar vista
    },
    datesSet: this.obtenerFechas.bind(this), // Evento para obtener fechas
    eventClick: this.handleEventClick.bind(this),
    eventOrder: 'order'
  };

  constructor(
    private visitasService: VisitasService,
    private guardiasService: GuardiasService,
    private cdr: ChangeDetectorRef,
    private documentService: DocumentsService,
    private ticketsService: TicketsService,
    private mantenimientoFactory: MantenimientoFactoryService,
    private branchesService: BranchesService,
    private datesHelper: DatesHelperService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerColores();
    this.obtenerSucursales();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idUsuarioFiltro'] && !changes['idUsuarioFiltro'].firstChange) {
      const calendarApi = this.calendarComponent?.getApi();
      if (calendarApi) {
        const view = calendarApi.view;
        this.mostrarEventos(view.activeStart, view.activeEnd);
      }
    }
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerFechas(info: any) {

    let fechaini: Date = info.start;
    let fechafin: Date = info.end;

    fechafin.setHours(0, 0, 0, 0);
    fechaini.setHours(0, 0, 0, 0);

    this.mostrarEventos(fechaini, fechafin);

  }

  async mostrarEventos(fechaIni: Date, fechaFin: Date) {
    this.loading = true;
    let visitas = await this.visitasService.obtenerVisitaFechas(fechaIni, fechaFin, this.usuario.idArea);

    let guardias = await this.guardiasService.obtenerGuardiasFechas(fechaIni, fechaFin, this.usuario.idArea);
    let calendarApi = this.calendarComponent!.getApi();

    if (this.idUsuarioFiltro) {
      visitas = visitas.filter(x => x.idUsuario == this.idUsuarioFiltro);
      guardias = guardias.filter(x => x.idUsuario == this.idUsuarioFiltro);
    }

    calendarApi.removeAllEvents();
    let contador = 1;
    for (let guardia of guardias) {
      calendarApi.addEvent({
        title: 'GUARDIA',
        start: this.datesHelper.getDate(guardia.fecha),
        end: this.datesHelper.getDate(guardia.fecha),
        allDay: true,
        color: this.obtenerColor(guardia.idUsuario),
        textColor: this.getLuminance(this.obtenerColor(guardia.idUsuario)) > 0.6 ? '#000000' : '#FFFFFF', // Color del texto
        extendedProps:
        {
          idUsuario: guardia.idUsuario
        },
        order: contador
      }
      );
      contador++;
    }
    for (let visita of visitas) {
      let comentario = '';

      for (let sucursal of visita.sucursalesProgramadas) {

        let fechaFin = this.datesHelper.getDate(visita.fecha);
        const ticketsFinalizados = await this.ticketsService
          .getFinalizedTicketsByEndDate(
            sucursal.id,
            fechaFin,
            visita.idArea
          );

        const servicio = this.mantenimientoFactory.getService(visita.idArea);


        let mantenimientos = await servicio
          .obtenerMantenimientoVisitaPorFecha(this.datesHelper.getDate(visita.fecha), sucursal.id, false);

        let temp = visita.comentarios.filter(x => x.idSucursal == sucursal.id);
        comentario = temp.length > 0 ? temp[0].comentario : '';
        calendarApi.addEvent({
          title: sucursal.nombre, start: this.datesHelper.getDate(visita.fecha),
          end: this.datesHelper.getDate(visita.fecha), allDay: true,
          color: this.obtenerColor(visita.idUsuario),
          textColor: this.getLuminance(this.obtenerColor(visita.idUsuario)) > 0.6 ? '#000000' : '#FFFFFF', // Color del texto
          extendedProps:
          {
            idSucursal: sucursal.id,
            idUsuario: visita.idUsuario,
            idArea: visita.idArea,
            comentario: comentario,
            ticketsCount: sucursal.idsTickets.length,
            idsTickets: sucursal.idsTickets,
            ticketsFinalizados: ticketsFinalizados.length,
            fechaVisita: visita.fecha,
            mantenimientosDelDia: mantenimientos
          },
          order: contador
        });
        contador++;
      }
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  obtenerNombreUsuario(idUsuario: string): string {
    let nombre = '';
    let temp = this.usuariosHelp.filter(x => x.id == idUsuario);
    if (temp.length > 0) { nombre = temp[0].nombre + ' ' + temp[0].apellidoP; }
    return nombre
  }

  obtenerUsuario(idUsuario: string) {
    return this.usuariosHelp.filter(x => x.id == idUsuario)[0];
  }

  obtenerTicketsPorSucursal(idSucursal: string) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  async handleEventClick(clickInfo: EventClickArg) {

    if (clickInfo.event.title != 'GUARDIA' && clickInfo.event.title.indexOf('ACTIVIDAD:') == -1) {
      let sucursal = this.sucursales.filter(x => x.nombre == clickInfo.event._def.title);
      this.FechaSeleccionada = clickInfo.event.start!;
      this.comentario = clickInfo.event.extendedProps['comentario'];
      this.usuarioSeleccionado = { ...this.obtenerUsuario(clickInfo.event.extendedProps['idUsuario']) };
      this.sucursalSeleccionada = {
        ...sucursal[0],
        idsTickets: clickInfo.event.extendedProps['idsTickets'],
        ticketsFinalizados: clickInfo.event.extendedProps['ticketsFinalizados'],
        fechaVisita: clickInfo.event.extendedProps['fechaVisita'],
        mantenimientosDelDia: clickInfo.event.extendedProps['mantenimientosDelDia'],
      };
      this.showModalEventeDetail = true;
      this.cdr.detectChanges();
    }
  }

  obtenerColores() {
    this.documentService.get('colores-usuarios').subscribe({
      next: (data) => {
        this.colores = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
      },
    });
  }

  obtenerColor(idUsuario: string): string {
    let color = '';
    let temp = this.colores.filter(x => x.idUsuario == idUsuario);
    color = temp.length > 0 ? temp[0].color : '';
    return color;
  }

  getLuminance(hexColor: string): number {
    if (hexColor == '') {
      return 0;
    } else {
      // Convertir el color hexadecimal a RGB
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      // Calcular la luminancia según la fórmula estándar
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
  }

  calcularPorcentaje(mantenimiento: any, idArea: string) {
    if (mantenimiento) {

      const servicio = this.mantenimientoFactory.getService(idArea);
      return servicio.calcularPorcentaje(mantenimiento);
    }
    else
      return 0
  }

  obtenerAreaPorUsuario(idUsuario: String) {
    return this.usuariosHelp.filter(x => x.id == idUsuario)[0].idArea
  }

  textoMantenimiento(idArea: string) {
    switch (idArea) {
      case '1':
        return '10X10';
      case '2':
        return '6X6';
      case '4':
        return '8X8';
      default:
        return 'XXX';
    }
  }
}
