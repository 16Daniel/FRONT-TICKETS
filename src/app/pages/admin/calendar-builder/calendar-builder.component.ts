import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { PickListModule } from 'primeng/picklist';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { EditorModule } from 'primeng/editor';
import { Subscription } from 'rxjs';

import { TicketsService } from '../../../services/tickets.service';
import { UsersService } from '../../../services/users.service';
import { BranchesService } from '../../../services/branches.service';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { Ticket } from '../../../models/ticket.model';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Visita } from '../../../models/visita-programada';
import { VisitasService } from '../../../services/visitas.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { GuardiasService } from '../../../services/guardias.service';
import { Guardia } from '../../../models/guardia';
import { ModalTicketDetailComponent } from "../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";
import { CalendarComponent } from "../../../components/common/calendar/calendar.component";
import { ModalColorsComponent } from "../../../modals/calendar/modal-colors/modal-colors.component";
import { DocumentsService } from '../../../services/documents.service';
import ModalEventDetailComponent from "../../../modals/calendar/modal-event-detail/modal-event-detail.component";
import { ComentarioVisita } from '../../../models/comentario-visita.model';
import { SucursalProgramada } from '../../../models/sucursal-programada.model';


@Component({
  selector: 'app-calendar-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PickListModule,
    DropdownModule,
    ToastModule,
    CalendarModule,
    EditorModule,
    ModalTicketDetailComponent,
    CalendarComponent,
    ModalColorsComponent,
    ModalEventDetailComponent
  ],
  providers: [MessageService],
  templateUrl: './calendar-builder.component.html',
})
export default class CalendarBuilderComponent implements OnInit {
  sucursales: Sucursal[] = [];
  sucursalesOrdenadas: Sucursal[] = [];
  sucursalesSeleccionadas: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  usuarioseleccionado: Usuario | undefined;
  fecha = new Date();
  ordenarxmantenimiento: boolean = false;
  arr_ultimosmantenimientos: Mantenimiento10x10[] = [];
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  itemtk: Ticket | undefined;
  subscriptiontk: Subscription | undefined;
  loading: boolean = false;
  formComentarios: string = "";
  vercalendario: boolean = false;
  showModalBranchDetail: boolean = false;
  sucursalSeleccionada: SucursalProgramada | undefined;
  indicacionesVisitas: ComentarioVisita[] = [];
  registroDeVisita: Visita | undefined = undefined;
  registroDeGuardia: Guardia | undefined = undefined;
  showModalTicketDetail: boolean = false;
  showModalColors: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private visitasService: VisitasService,
    private mantenimientoService: Maintenance10x10Service,
    private guardiaService: GuardiasService,
    private documentService: DocumentsService
  ) {
    registerLocaleData(localeEs);
  }
  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerUsuariosHelp();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async obtenerTodosLosTickets(): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .get()
      .subscribe({
        next: (data) => {
          this.tickets = [];
          this.tickets = data;
          let arr_temp: Ticket[] = [];
          let temp1: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '1'
          );
          let temp2: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '2'
          );
          let temp3: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '3'
          );
          let temp4: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '4'
          );

          temp1 = temp1.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp2 = temp2.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp3 = temp3.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp4 = temp4.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );
          arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
          this.todosLosTickets = [...arr_temp];
          this.tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
            }
          }

          this.obtnerUltimosMantenimientos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter(x => x.idRol == '4');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.obtenerTodosLosTickets();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {

    return catsucursales.sort((a, b) => {
      if (this.ordenarxmantenimiento) {
        const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id);
        const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id);
        return mantenimientoA - mantenimientoB; // Ordena de mayor a menor
      } else {
        const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
        const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;
        return ticketsB - ticketsA; // Ordena de mayor a menor
      }
    });
  }

  obtenerTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  obtenerPorcentajedeUltimoMantenimiento(idSucursal: string): number {
    let porcentaje = 0;
    let registro = this.arr_ultimosmantenimientos.filter(x => x.idSucursal == idSucursal);
    if (registro.length > 0) {
      porcentaje = this.calcularPorcentaje(registro[0]);
    }
    return porcentaje
  }

  calcularPorcentaje(mantenimiento: Mantenimiento10x10): number {
    let porcentaje = 0;
    mantenimiento.mantenimientoCaja ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoImpresoras ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoRack ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoPuntosVentaTabletas
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoContenidosSistemaCable
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoInternet ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoCCTV ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoNoBrakes ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoTiemposCocina ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoConcentradorApps
      ? (porcentaje += 10)
      : porcentaje;

    return porcentaje;
  }

  async consultarUsuario() {
    this.sucursalesSeleccionadas = [];
    this.sucursalesOrdenadas = [];
    this.indicacionesVisitas = [];
    if (!this.vercalendario && this.usuarioseleccionado != undefined) {
      this.loading = true;
      let visitas = await this.visitasService.obtenerVisitaUsuario(this.fecha, this.usuarioseleccionado!.id);
      let guardias = await this.guardiaService.obtenerGuardiaUsuario(this.fecha, this.usuarioseleccionado!.id);
      this.registroDeVisita = visitas.length > 0 ? visitas[0] : undefined;
      this.registroDeGuardia = guardias.length > 0 ? guardias[0] : undefined;
      const sucursalesDisponibles = this.sucursales.filter(sucursal =>
        !this.usuarioseleccionado!.sucursales.some(sucursalUsuario => sucursalUsuario.id === sucursal.id)
      );

      let sucursalesDelUsuarioOrdenadas = this.ordenarSucursalesUser(this.usuarioseleccionado!.sucursales);

      if (this.obtenerTicketsPorSucursal(sucursalesDelUsuarioOrdenadas[0].id).length == 0) {
        this.ordenarxmantenimiento = true;
        sucursalesDelUsuarioOrdenadas = this.ordenarSucursalesUser(this.usuarioseleccionado!.sucursales);
        this.ordenarxmantenimiento = false;
      }

      let sucursalesDisponilesOrdenadas = this.ordenarSucursalesUser(sucursalesDisponibles);

      if (this.obtenerTicketsPorSucursal(sucursalesDisponilesOrdenadas[0].id).length == 0) {
        this.ordenarxmantenimiento = true;
        sucursalesDisponilesOrdenadas = this.ordenarSucursalesUser(sucursalesDisponibles);
        this.ordenarxmantenimiento = false;
      }

      this.sucursalesOrdenadas.push(...sucursalesDelUsuarioOrdenadas);
      this.sucursalesOrdenadas.push(...sucursalesDisponilesOrdenadas);

      if (this.registroDeVisita != undefined) {
        for (let suc of this.registroDeVisita.sucursalesProgramadas) {
          const temp = sucursalesDelUsuarioOrdenadas.filter(x => x.id == suc.id);
          let index = this.sucursalesOrdenadas.indexOf(temp[0]);
          if (index !== -1) {
            this.sucursalesOrdenadas.splice(index, 1); // Elimina el elemento en la posición encontrada
          }

          this.sucursalesSeleccionadas.push(suc);
        }
      } else {
        this.sucursalesSeleccionadas.push(this.sucursalesOrdenadas[0]);
        this.sucursalesOrdenadas.shift();
      }

      if (this.registroDeGuardia != undefined) {
        let guardia = { id: '-999', nombre: 'GUARDIA' }
        this.sucursalesSeleccionadas.unshift(guardia);
      } else {
        let guardia = { id: '-999', nombre: 'GUARDIA' }
        this.sucursalesOrdenadas.unshift(guardia);
      }

      this.actualizarListasComentarios();
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async guardarVisita() {
    this.loading = true;
    if (this.sucursalesSeleccionadas.some(x => x.id == '-999')) {
      this.registrarGuardia();
    }

    let sucursalesProgramadas = this.sucursalesSeleccionadas.filter(x => x.id != '-999').map(sucursal => {
      return {
        ...sucursal,
        idsTickets: this.obtenerTicketsPorSucursal(sucursal.id).map(ticket => ticket.id)
      }
    })

    let visita: Visita =
    {
      idUsuario: this.usuarioseleccionado!.id,
      fecha: Timestamp.fromDate(this.fecha),
      sucursalesProgramadas,
      comentarios: this.indicacionesVisitas,
    }

    try {
      await this.visitasService.create(visita);
      for (let sucursal of this.sucursalesSeleccionadas) {
        if (sucursal.id != '-999') {
          this.nuevoMantenimiento(sucursal.id, this.usuarioseleccionado!.id, this.fecha);
        }
      }
      this.showMessage('success', 'Success', 'Guardado correctamente');
      this.formComentarios = '';
      this.sucursalesOrdenadas = [];
      this.sucursalesSeleccionadas = [];
      this.usuarioseleccionado = undefined;
      this.registroDeGuardia = undefined;
      this.registroDeVisita = undefined
      this.indicacionesVisitas = [];
    } catch (error) {
      this.showMessage('error', 'Error', 'Error al guardar');
      console.log(error);
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async nuevoMantenimiento(idSucursal: string, idUsuario: string, fecha: Date) {
    // fecha.setHours(0, 0, 0, 0);
    const mantenimiento: Mantenimiento10x10 = {
      idSucursal: idSucursal,
      idUsuarioSoporte: idUsuario,
      fecha: fecha,
      estatus: true,
      mantenimientoCaja: false,
      mantenimientoCCTV: false,
      mantenimientoConcentradorApps: false,
      mantenimientoContenidosSistemaCable: false,
      mantenimientoImpresoras: false,
      mantenimientoInternet: false,
      mantenimientoNoBrakes: false,
      mantenimientoPuntosVentaTabletas: false,
      mantenimientoRack: false,
      mantenimientoTiemposCocina: false,
      observaciones: '',
    };

    await this.mantenimientoService.create(mantenimiento);
  }

  asignadaAlUsuario(idSucursal: string): boolean {
    if (this.usuarioseleccionado!.sucursales.some(sucursalUsuario => sucursalUsuario.id === idSucursal)) {
      return true;
    } else {
      return false;
    }
  }

  async registrarGuardia() {
    // this.fecha.setHours(0, 0, 0, 0);
    const guardia: Guardia =
    {
      idUsuario: this.usuarioseleccionado!.id,
      fecha: Timestamp.fromDate(this.fecha)
    }

    try {
      await this.guardiaService.create(guardia);
      this.showMessage('success', 'Success', 'Guardado correctamente')
    } catch (error) {

    }
  }

  detalles(sucursal: Sucursal) {
    this.showModalBranchDetail = true;
    this.sucursalSeleccionada = {
      ...sucursal,
      idsTickets: this.obtenerTicketsPorSucursal(sucursal.id).map(ticket => ticket.id)
    };
  }

  actualizarListasComentarios() {
    this.indicacionesVisitas = [];
    for (let item of this.sucursalesSeleccionadas) {
      if (item.id != '-999') {
        let comentario = '';
        if (this.registroDeVisita != undefined) {
          let temp = this.registroDeVisita.comentarios.filter(x => x.idSucursal == item.id);
          if (temp.length > 0) { comentario = temp[0].comentario; }
        }
        this.indicacionesVisitas.push(
          {
            idSucursal: item.id,
            comentario: comentario
          }
        );
      }
    }
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let nombre = '';
    let data = this.sucursales.filter(x => x.id == idSucursal);
    if (data.length > 0) {
      nombre = data[0].nombre;
    }
    return nombre;
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;
  }

  obtnerUltimosMantenimientos() {
    let sucursales: Sucursal[] = [...this.sucursales];
    let array_ids_Sucursales: string[] = [];

    for (let item of sucursales) {
      array_ids_Sucursales.push(item.id);
    }

    this.loading = true;
    this.subscriptiontk = this.mantenimientoService
      .obtenerUltimosMantenimientos(array_ids_Sucursales)
      .subscribe({
        next: (data) => {
          this.arr_ultimosmantenimientos = data.filter(
            (elemento): elemento is Mantenimiento10x10 => elemento !== null
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los mantenimientos:', error);
        },
      });
  }

  obtenerMantenimientoSucursal(idSucursal: string): Mantenimiento10x10[] {
    return this.arr_ultimosmantenimientos.filter(x => x.idSucursal == idSucursal);
  }

  abrirmodalColores() {
    this.showModalColors = true;
    this.cdr.detectChanges();
  }

  async actualizar() {
    this.loading = true;
    if (this.registroDeGuardia != undefined) {
      await this.documentService.deleteDocument('guardias', this.registroDeGuardia.id);
    }

    if (this.registroDeVisita != undefined) {

      for (let sucursal of this.registroDeVisita.sucursalesProgramadas) {
        let temp = await this.mantenimientoService.obtenerMantenimientoVisita(this.getDate(this.registroDeVisita.fecha), sucursal.id);
        if (temp.length > 0) {
          await this.documentService.deleteDocument('mantenimientos-10x10', temp[0].id);
        }
      }

      await this.documentService.deleteDocument('visitas_programadas', this.registroDeVisita.id);
    }

    this.guardarVisita()

  }

  getDate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }
}
