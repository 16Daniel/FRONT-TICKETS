import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  input,
  OnInit,
  Output,
} from '@angular/core';
import { StatusTicket } from '../../../models/status-ticket.model';
import { Categoria } from '../../../models/categoria.mdoel';
import { Ticket } from '../../../models/ticket.model';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../services/categories.service';
import { StatusTicketService } from '../../../services/status-ticket.service';
import { Area } from '../../../models/area';
import { AreasService } from '../../../services/areas.service';

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

  ticketsFiltrados: Ticket[] = [];

  filterstatus: any | undefined;
  filterPrioridad: any | undefined;
  filtercategoria: any | undefined;
  filterarea: any | undefined;

  statusTicket: StatusTicket[] = [];
  categorias: Categoria[] = [];
  areas: Area[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private statusTicketService: StatusTicketService,
    private areasService: AreasService,
  ) {}

  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerAreas();
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

  obtenerAreas() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data;
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
        (x) => x.prioridadSucursal == this.filterPrioridad.name
      );
    }

    if (this.filterarea != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idProveedor == this.filterarea.id
      );
    }

    if (this.filtercategoria != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idCategoria == this.filtercategoria.id
      );
    }
    if (this.filterstatus != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.estatus == this.filterstatus.id
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

  onChangeProveedor() {
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
