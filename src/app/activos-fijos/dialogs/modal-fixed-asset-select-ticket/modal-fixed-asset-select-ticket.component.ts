import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../../tickets/models/ticket.model';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { AreasService } from '../../../areas/services/areas.service';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ActivoFijo } from '../../interfaces/activo-fijo.model';

@Component({
  selector: 'app-modal-fixed-asset-select-ticket',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule, ModalTicketDetailComponent, TooltipModule],
  templateUrl: './modal-fixed-asset-select-ticket.component.html',
  styleUrl: './modal-fixed-asset-select-ticket.component.scss'
})
export class ModalFixedAssetSelectTicketComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() ticketSelectedEvent = new EventEmitter<Ticket>();
  usuariosHelp: Usuario[] = [];

  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | undefined;
  mostrarModalTicketDetail: boolean = false;

  constructor(
    public datesHelper: DatesHelperService,
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private areasService: AreasService,
    private messageService: MessageService,

  ) { }

  ngOnInit(): void {
    this.obtenerTickets();
    this.obtenerUsuariosHelp();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == '2') {
      str = '#ff0000';
    }

    if (value == '3') {
      str = '#ffe800';
    }

    if (value == '4') {
      str = '#61ff00';
    }

    if (value == '1') {
      str = 'black';
    }
    return str;
  }

  onSeleccionarTicket(ticket: Ticket) {
    this.ticketSelectedEvent.emit(ticket);
    this.onHide();
  }

  async obtenerTickets() {
    this.tickets = await this.ticketsService.obtenerTicketsPorActivo(this.activoFijo);
    this.tickets = this.tickets.filter(item => item.idEstatusTicket != '3')
    this.cdr.detectChanges();
  }

  obtenerNombreArea(idArea: string): string {
    let nombre = '';
    let area = this.areasService.areas.filter((x) => x.id == idArea);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  obtenerUsuariosHelp() {
    this.usuariosHelp = this.usersService.usuarios;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
