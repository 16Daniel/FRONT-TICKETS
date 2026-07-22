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
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';

import { ModalFilterTicketsComponent } from '../modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketDetailComponent } from '../modal-ticket-detail/modal-ticket-detail.component';
import { RequesterTicketsListComponent } from '../../components/requester-tickets-list/requester-tickets-list.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { Area } from '../../../areas/interfaces/area.model';
import { Ticket } from '../../interfaces/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { CategoriesService } from '../../services/categories.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { UsersService } from '../../../usuarios/services/users.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-historial-tickets-dialog',
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
  templateUrl: './historial-tickets-dialog.component.html',
  styleUrl: './historial-tickets-dialog.component.scss',
})
export class HistorialTicketsDialogComponent implements OnDestroy, OnInit {
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
  usuariosHelp: Usuario[] = [];
  estatusTickets: EstatusTicket[] = [];

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
    private branchesService: BranchesService,
    private usersService: UsersService,
    private statusTicketsService: StatusTicketService
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
    this.obtenerUsuariosHelp();
    this.obtenerCatalogoEstatusTickets();
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

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerCatalogoEstatusTickets() {
    this.statusTicketsService.get().subscribe(result => this.estatusTickets = result);
  }

  getDate(tsmp: any): Date | null {
    if (!tsmp) return null;
    try {
      return tsmp.toDate();
    } catch {
      return tsmp;
    }
  }

  obtenerNombreArea(idArea: string): string {
    return this.areas.find(x => x.id == idArea)?.nombre || '';
  }

  obtenerNombreSucursal(idSucursal: string): string {
    return this.sucursales.find(x => x.id == idSucursal)?.nombre || '';
  }

  obtenerNombreResponsable(id: string): string {
    const user = this.usuariosHelp.find(x => x.id == id);
    return user ? `${user.nombre} ${user.apellidoP}` : '';
  }

  obtenerNombreEstatusTicket(idEstatusTicket: string): string {
    return this.estatusTickets.find(x => x.id == idEstatusTicket)?.nombre || '';
  }

  formatDate(date: any): string {
    const d = this.getDate(date);
    if (!d) return '';
    try {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    } catch {
      return '';
    }
  }

  exportToExcel(filename: string = 'historial_tickets.xlsx'): void {
    if (this.ticketsFiltrados.length === 0) {
      this.showMessage('warn', 'Atención', 'No hay datos para exportar');
      return;
    }

    const datosExportar = this.ticketsFiltrados.map(t => ({
      FOLIO: t.folio,
      'FECHA DE SOLICITUD': this.formatDate(t.fecha),
      'FECHA DE TERMINO': t.fechaFin ? this.formatDate(t.fechaFin) : 'N/A',
      SUCURSAL: this.obtenerNombreSucursal(t.idSucursal),
      AREA: this.obtenerNombreArea(t.idArea),
      SOLICITANTE: t.solicitante ? t.solicitante.toUpperCase() : '',
      RESPONSABLE: this.obtenerNombreResponsable(t.idResponsableFinaliza),
      CATEGORÍA: t.nombreCategoria || '',
      SUBCATEGORÍA: t.idSubcategoria == null ? 'N/A' : t.nombreSubcategoria,
      ESTATUS: this.obtenerNombreEstatusTicket(t.idEstatusTicket),
      CALIFICACIÓN: t.calificacion || 0,
      DESCRIPCIÓN: t.descripcion || ''
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');

    XLSX.writeFile(wb, filename);
  }

}
