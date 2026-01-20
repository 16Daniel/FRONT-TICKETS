import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

import { Ticket } from '../../models/ticket.model';
import { PrioridadTicket } from '../../models/prioridad-ticket.model';
import { EstatusTicket } from '../../models/estatus-ticket.model';
import { Categoria } from '../../models/categoria.mdoel';
import { CategoriesService } from '../../services/categories.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { AreasService } from '../../../areas/services/areas.service';
import { TicketsPriorityService } from '../../services/tickets-priority.service';
import { Area } from '../../../areas/models/area.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';

@Component({
  selector: 'app-modal-filter-tickets',
  standalone: true,
  imports: [DialogModule, DropdownModule, FormsModule, CommonModule],
  templateUrl: './modal-filter-tickets.component.html',
  styleUrl: './modal-filter-tickets.component.scss',
})
export class ModalFilterTicketsComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() showModalFilterTickets: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() ticketsFiltradosEvent = new EventEmitter<Ticket[]>();
  @Input() sucursales: Sucursal[] = [];

  ticketsFiltrados: Ticket[] = [];
  filterstatus: any | undefined;
  filterPrioridad: any | undefined;
  filtercategoria: any | undefined;
  filterarea: any | undefined;
  filterSucursal: any | undefined;
  prioridadesTicket: PrioridadTicket[] = [];
  statusTicket: EstatusTicket[] = [];
  categorias: Categoria[] = [];
  areas: Area[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private statusTicketService: StatusTicketService,
    private areasService: AreasService,
    private ticketsPriorityService: TicketsPriorityService
  ) {
    this.obtenerPrioridadesTicket();
  }

  ngOnInit(): void {
    this.areas = this.areasService.areas;
    this.obtenerCategorias();
    this.obtenerStatusTickets();
  }

  obtenerCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerPrioridadesTicket() {
    this.ticketsPriorityService.get().subscribe({
      next: (data) => {
        this.prioridadesTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerStatusTickets() {
    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.statusTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  filtrarTickets() {
    this.ticketsFiltrados = [...this.tickets];
    if (this.filterPrioridad != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idPrioridadTicket == this.filterPrioridad.id
      );
    }

    if (this.filterarea != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idArea == this.filterarea.id
      );
    }

    if (this.filtercategoria != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idCategoria == this.filtercategoria.id
      );
    }
    if (this.filterstatus != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idEstatusTicket == this.filterstatus.id
      );
    }
    if (this.filterSucursal != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idSucursal == this.filterSucursal.id
      );
    }
    this.ticketsFiltradosEvent.emit(this.ticketsFiltrados); // Cerrar modal
    this.closeEvent.emit(false); // Cerrar modal
  }

  limpiarFiltros() {
    this.ticketsFiltrados = [...this.tickets];
    this.filterPrioridad = undefined;
    this.filterarea = undefined;
    this.filtercategoria = undefined;
    this.filterstatus = undefined;

    this.ticketsFiltradosEvent.emit(this.tickets); // Cerrar modal
    this.closeEvent.emit(false); // Cerrar modal
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }

  onChangeArea() {
    if (this.filterarea != undefined) {
      this.categoriesService.getCategoriasprov(this.filterarea.id).subscribe({
        next: (data) => {
          this.categorias = data;
          // this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          this.showMessage('error', 'Error', 'Error al procesar la solicitud');
        },
      });
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }
}
