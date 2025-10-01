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

import { TicketsService } from '../../../../services/tickets.service';
import { BranchesService } from '../../../../services/branches.service';
import { Sucursal } from '../../../../models/sucursal.model';
import { Usuario } from '../../../../models/usuario.model';
import { Ticket } from '../../../../models/ticket.model';
import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { VisitaProgramada } from '../../../../models/visita-programada';
import { VisitasService } from '../../../../services/visitas.service';
import { GuardiasService } from '../../../../services/guardias.service';
import { Guardia } from '../../../../models/guardia';
import { ModalTicketDetailComponent } from "../../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";
import { ModalColorsComponent } from "../../../../modals/calendar/modal-colors/modal-colors.component";
import { DocumentsService } from '../../../../services/documents.service';
import { ComentarioVisita } from '../../../../models/comentario-visita.model';
import { Area } from '../../../../models/area.model';
import { ModalActivityComponent } from '../../../../modals/calendar/modal-activity/modal-activity.component';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { MaintenanceMtooService } from '../../../../services/maintenance-mtto.service';
import { MantenimientoFactoryService } from '../../../../services/maintenance-factory.service';
import { CalendarComponent } from '../../../../components/calendar/calendar.component';
import { BranchVisitItemComponent } from '../../../../components/branch-visit-item/branch-visit-item.component';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { UsersService } from '../../../../services/users.service';
import { ParticipanteChat } from '../../../../models/participante-chat.model';

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
    BranchVisitItemComponent,
    ModalActivityComponent
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
  indicacionesVisitas: ComentarioVisita[] = [];
  registroDeVisita: VisitaProgramada | undefined = undefined;
  registroDeGuardia: Guardia | undefined = undefined;
  showModalTicketDetail: boolean = false;
  showModalColors: boolean = false;
  usuario: Usuario;
  area: Area | any;
  mostrarModalActividades: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private visitasService: VisitasService,
    private guardiaService: GuardiasService,
    private documentService: DocumentsService,
    private mantenimientoFactory: MantenimientoFactoryService,
    private fixedAssetsService: FixedAssetsService,
    private maintenanceMtooService: MaintenanceMtooService,
    private datesHelper: DatesHelperService
  ) {
    registerLocaleData(localeEs);
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
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
      .get(this.usuario.idArea)
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
    this.usersService.getUsuariosPorRol(['4', '7', '5'], this.usuario.idArea)
      .subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
        this.obtenerTodosLosTickets();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  ordenarSucursalesUser(sucursales: Sucursal[]): Sucursal[] {
    return sucursales.sort((a, b) => {
      if (this.ordenarxmantenimiento) {
        const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id) ?? Infinity;
        const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id) ?? Infinity;
        return mantenimientoA - mantenimientoB; // Ordena de menor a mayor
      } else {
        const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
        const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;

        if (ticketsA === ticketsB) {
          const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id) ?? Infinity;
          const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id) ?? Infinity;
          return mantenimientoA - mantenimientoB; // En empate de tickets, ordena por menor porcentaje
        }

        return ticketsB - ticketsA; // Ordena por cantidad de tickets de mayor a menor
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
      const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);
      porcentaje = servicio.calcularPorcentaje(registro[0]);
    }
    return porcentaje
  }

  async llenarInfoUsuario() {
    this.sucursalesSeleccionadas = [];
    this.sucursalesOrdenadas = [];
    this.indicacionesVisitas = [];

    if (!this.vercalendario && this.usuarioseleccionado != undefined) {

      this.loading = true;
      let visitas = await this.visitasService.obtenerVisitaUsuario(this.fecha, this.usuarioseleccionado!.id);
      let guardias = await this.guardiaService.obtenerGuardiaUsuario(this.fecha, this.usuarioseleccionado!.id, this.usuarioseleccionado.idArea);

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
        let guardia: any = { id: '-999', nombre: 'GUARDIA' }
        this.sucursalesSeleccionadas.unshift(guardia);
      } else {
        let guardia: any = { id: '-999', nombre: 'GUARDIA' }
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

    let sucursalesProgramadas = this.sucursalesSeleccionadas
      .filter(x => x.id != '-999')
      .map(sucursal => {
        return {
          ...sucursal,
          idsTickets: this.obtenerTicketsPorSucursal(sucursal.id).map(ticket => ticket.id)
        }
      })

    let visita: VisitaProgramada =
    {
      idUsuario: this.usuarioseleccionado!.id,
      fecha: Timestamp.fromDate(this.fecha),
      sucursalesProgramadas,
      comentarios: this.indicacionesVisitas,
      idArea: this.usuario.idArea
    }

    try {
      await this.visitasService.create(visita);

      for (let sucursal of this.sucursalesSeleccionadas) {
        if (sucursal.id != '-999' && sucursal.id != '-998') {

          let participantesChat: ParticipanteChat[] = [];

          participantesChat.push({
            idUsuario: this.usuarioseleccionado!.id,
            ultimoComentarioLeido: 0,
          });

          let administradoresArea = this.usersService.usuarios
            .filter(usuario => usuario.idRol == '5' && usuario.idArea == this.usuario.idArea);

          let administradores = this.usersService.usuarios
            .filter(usuario => usuario.idRol == '1' && usuario.idArea == this.usuario.idArea);

          let sucursales = this.usersService.usuarios
            .filter(usuario => usuario.idRol == '2');

          administradoresArea.forEach(usuario => {
            participantesChat.push({
              idUsuario: usuario.id,
              ultimoComentarioLeido: 0,
            });
          });

          administradores.forEach(usuario => {
            participantesChat.push({
              idUsuario: usuario.id,
              ultimoComentarioLeido: 0,
            });
          });

          sucursales.forEach(usuario => {
            participantesChat.push({
              idUsuario: usuario.id,
              ultimoComentarioLeido: 0,
            });
          });









          if (this.tieneMantenimientosActivos(sucursal.id)) {

            if (this.usuario.idArea == '4') {
              let freidoras = await this.fixedAssetsService.obtenerFredioras(sucursal.id);
              console.log(freidoras)

              if (freidoras.length == 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Se registró la visita pero no se encontraron freidoras en activos fijos',
                  life: 7000
                });
              }

              freidoras.forEach(async element => {
                const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

                this.usuario.idArea == '4' ?
                  await this.maintenanceMtooService.create2(
                    sucursal.id,
                    this.usuarioseleccionado!.id,
                    this.fecha,
                    element.id!,
                    element.descripcion,
                    element.referencia,
                    participantesChat
                  ) : await servicio.create(sucursal.id, this.usuarioseleccionado!.id, this.fecha, participantesChat);
              });
            }
            else {
              const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);
              await servicio.create(sucursal.id, this.usuarioseleccionado!.id, this.fecha, participantesChat);
            }
          }

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

  tieneMantenimientosActivos(idSucursal: string | number): boolean {
    const sucursal = this.sucursales.find(s => String(s.id) === String(idSucursal));

    if (!sucursal || !Array.isArray(sucursal.activoMantenimientos)) {
      return false;
    }

    return sucursal.activoMantenimientos.includes(String(this.usuario.idArea));
  }

  async registrarGuardia() {
    // this.fecha.setHours(0, 0, 0, 0);
    const guardia: Guardia =
    {
      idUsuario: this.usuarioseleccionado!.id,
      idArea: this.usuarioseleccionado!.idArea,
      fecha: Timestamp.fromDate(this.fecha)
    }

    try {
      await this.guardiaService.create(guardia);
      this.showMessage('success', 'Success', 'Guardado correctamente')
    } catch (error) {

    }
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

  async obtnerUltimosMantenimientos() {
    let sucursales: Sucursal[] = [...this.sucursales];
    let array_ids_Sucursales: string[] = [];

    for (let item of sucursales) {
      array_ids_Sucursales.push(item.id);
    }

    this.loading = true;
    const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);
    this.subscriptiontk = servicio
      .getUltimosMantenimientos(array_ids_Sucursales)
      .subscribe({
        next: (data: any) => {
          this.arr_ultimosmantenimientos = data.filter(
            (elemento: any): elemento is Mantenimiento10x10 => elemento !== null
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error al escuchar los mantenimientos:', error);
        },
      });
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

        const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);
        let temp = await servicio.obtenerMantenimientoVisitaPorFechaArea(this.datesHelper.getDate(this.registroDeVisita.fecha), sucursal.id);
        temp.forEach(async (element: any) => {
          await servicio.delete(element.id);
        });
      }

      await this.documentService.deleteDocument('visitas_programadas', this.registroDeVisita.id);
    }

    this.guardarVisita()

  }

  async agregarActividad(texto: string) {
    this.mostrarModalActividades = false;
    texto = `ACTIVIDAD: ${texto}`;
    let actividad: any = { id: '-998', nombre: texto }
    this.sucursalesSeleccionadas = [actividad, ...this.sucursalesSeleccionadas];
  }
}
