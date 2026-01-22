import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import ModalEventDetailComponent from '../../dialogs/modal-event-detail/modal-event-detail.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../../tickets/models/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { DocumentsService } from '../../../shared/services/documents.service';
import { AreasService } from '../../../areas/services/areas.service';
import { ColorUsuario } from '../../interfaces/color-usuario';
import { Mantenimiento10x10 } from '../../interfaces/mantenimiento-10x10.model';
import { VisitaProgramada } from '../../interfaces/visita-programada';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';

@Component({
  selector: 'app-branch-visit-schedule-page',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalEventDetailComponent, CalendarComponent, DropdownModule, FormsModule],
  providers: [MessageService],
  templateUrl: './branch-visit-schedule-page.component.html',
})

export default class BranchVisitSchedulePageComponent implements OnInit {
  usuariosHelp: Usuario[] = [];
  colorUsuario: ColorUsuario | undefined;
  tickets: Ticket[] = [];
  arr_ultimosmantenimientos: Mantenimiento10x10[] = []; // <--- revisar
  usuario: Usuario;
  arr_data: VisitaProgramada[] = [];
  sucursalSeleccionada: Sucursal | undefined;
  FechaSeleccionada: Date = new Date();
  showModalTicketDetail: boolean = false;
  showModalEventeDetail: boolean = false;
  itemtk: Ticket | undefined;
  colores: ColorUsuario[] = [];
  loading: boolean = true;
  subscriptiontk: Subscription | undefined;
  areas: Area[] = [];
  idArea: string = '';

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private messageService: MessageService,
    private documentService: DocumentsService,
    private areasService: AreasService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idArea = this.usuario.idArea;
  }

  showMessage = (sev: string, summ: string, det: string) =>
    this.messageService.add({ severity: sev, summary: summ, detail: det });


  ngOnInit(): void {
    this.areasService.areas$.subscribe(areas => this.areas = areas);
    this.obtenerUsuariosHelp();
    this.obtenerTodosLosTickets();
    this.obtenerColores();
  }

  obtenerColores() {
    this.documentService.get('colores-usuarios').subscribe({
      next: (data) => {
        this.colores = data;
        let temp = this.colores.filter(x => x.idUsuario == this.usuario.id);
        this.colorUsuario = temp.length > 0 ? temp[0] : undefined;
        this.cdr.detectChanges();
      },
      error: (error) => {
      },
    });
  }

  obtenerUsuariosHelp() {
    this.usersService.usuarios$
      .subscribe(usuarios => this.usuariosHelp = usuarios.filter(x => x.idRol == '4' || x.idRol == '5' || x.idRol == '7'));
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
          this.tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
            }
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  obtenerNombreUsuario(idUsuario: string): string {
    let nombre = '';
    let temp = this.usuariosHelp.filter(x => x.id == idUsuario);
    if (temp.length > 0) { nombre = temp[0].nombre + ' ' + temp[0].apellidoP; }
    return nombre
  }

  onChangeArea() {

  }
}
