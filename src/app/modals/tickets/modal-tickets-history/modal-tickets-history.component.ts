import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';

import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';
import { ModalFilterTicketsComponent } from '../modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketDetailComponent } from '../modal-ticket-detail/modal-ticket-detail.component';
import { Usuario } from '../../../models/usuario.model';
import { RequesterTicketsListComponent } from '../../../components/requester-tickets-list/requester-tickets-list.component';
import { DropdownModule } from 'primeng/dropdown';
import { Categoria } from '../../../models/categoria.mdoel';
import { CategoriesService } from '../../../services/categories.service';
import { Area } from '../../../models/area.model';
import { AreasService } from '../../../services/areas.service';
import { BranchesService } from '../../../services/branches.service';
import { Sucursal } from '../../../models/sucursal.model';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-modal-tickets-history',
  standalone: true,
  imports: [
    DialogModule,
    RequesterTicketsListComponent,
    CalendarModule,
    FormsModule,
    ModalFilterTicketsComponent,
    CommonModule,
    ModalTicketDetailComponent,
    DropdownModule,
    MultiSelectModule
  ],
  templateUrl: './modal-tickets-history.component.html',
  styleUrl: './modal-tickets-history.component.scss',
})
export class ModalTicketsHistoryComponent implements OnDestroy, OnInit {
  @Input() showModalHistorial: boolean = false;
  @Input() idArea: string = '';
  @Output() closeEvent = new EventEmitter<boolean>();

  showModalFilterTickets: boolean = false;
  private unsubscribe!: () => void;
  usuario: Usuario;

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  categorias: Categoria[] = [];
  areas: Area[] = [];
  sucursales: Sucursal[] = [];

  idCategoria: string = ''
  idsucursales: string[] = [];
  calificacion?: number;

  textoBusqueda: string = '';
  ticketsFiltrados: Ticket[] = [];

  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;

  opcionesCalificacion = [
    { label: '1 estrella', value: 1 },
    { label: '2 estrellas', value: 2 },
    { label: '3 estrellas', value: 3 },
    { label: '4 estrellas', value: 4 },
    { label: '5 estrellas', value: 5 },
  ];


  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private areasService: AreasService,
    private branchesService: BranchesService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerCategorias();
    this.areas = this.areasService.areas;
    this.branchesService.get().subscribe(sucursales => {
      this.sucursales = sucursales;
      this.idsucursales = [this.usuario.sucursales[0].id];
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onHide = () => this.closeEvent.emit();

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;
  }

  buscar() {
    console.log(this.idsucursales)
    this.ticketsService.getHistorialTickets(
      this.fechaInicio,
      this.fechaFin,
      this.idsucursales,
      this.idArea,
      (this.idCategoria ? this.idCategoria.toString() : undefined),
      this.calificacion
    ).then(tickets => {
      this.tickets = tickets;
      this.ticketsFiltrados = [...this.tickets];
      (tickets.length > 0) ?
        this.showMessage('success', 'Success', 'Información localizada') :
        this.showMessage(
          'warn',
          'Atención!',
          'No se encontró información'
        );

      this.todosLosTickets = [...this.tickets];
      this.cdr.detectChanges();
    });
  }

  showMessage = (sev: string, summ: string, det: string) => this.messageService.add({ severity: sev, summary: summ, detail: det });

  obtenerCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  applyFiltroTexto(valor: string): void {
    const txt = (valor || '').toLowerCase().trim();

    if (txt === '') {
      this.ticketsFiltrados = [...this.tickets];
      return;
    }

    this.ticketsFiltrados = this.tickets.filter(t =>
      t.descripcion?.toLowerCase().includes(txt)
    );
  }

}
