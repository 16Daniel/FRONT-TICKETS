import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';

import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { RequesterTicketsListComponent } from "../../../components/tickets/requester-tickets-list/requester-tickets-list.component";
import { BranchMaintenanceTableComponent } from "../../../components/maintenance/branch-maintenance-table/branch-maintenance-table.component";
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
import { ModalTicketDetailComponent } from "../../tickets/modal-ticket-detail/modal-ticket-detail.component";
import { ModalMaintenanceDetailComponent } from "../../maintenance/modal-maintenance-detail/modal-maintenance-detail.component";
import { TicketsService } from '../../../services/tickets.service';
import { SucursalProgramada } from '../../../models/sucursal-programada.model';

@Component({
  selector: 'app-modal-event-detail',
  standalone: true,
  imports: [DialogModule,
    CommonModule,
    FormsModule,
    RequesterTicketsListComponent,
    BranchMaintenanceTableComponent,
    EditorModule, ModalTicketDetailComponent, ModalMaintenanceDetailComponent],
  templateUrl: './modal-event-detail.component.html',
})

export default class ModalEventDetailComponent {
  @Input() showModalEventeDetail: boolean = false;
  @Input() sucursal: SucursalProgramada | any;
  @Input() fecha: Date = new Date();
  @Input() usuariosHelp: Usuario[] = [];
  @Input() Indicacion: string = '';
  @Input() comentario: string = '';
  @Input() idsTickets: string[] = [];
  @Output() clickEvent = new EventEmitter<Ticket>();
  @Output() closeEvent = new EventEmitter<boolean>();

  tickets: Ticket[] = [];
  showModalTicketDetail: boolean = false;
  itemtk: Ticket | undefined;
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: Mantenimiento10x10 | any;
  loading: boolean = true;

  constructor(private ticketsService: TicketsService,) {
    registerLocaleData(localeEs);
  }

  ngOnInit() {
    this.obtenerTickets();
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.clickEvent.emit(ticket);
    this.showModalTicketDetail = true;
  }

  abrirModalDetalleMantenimiento(mantenimiento: Mantenimiento10x10 | any) {
    this.mantenimiento = mantenimiento;
    this.mostrarModalDetalleMantenimeinto = true;
  }

  async obtenerTickets() {
    this.loading = true;
    this.tickets = await this.ticketsService.getByIds(this.sucursal.idsTickets);
    this.loading = false;
  }
}
