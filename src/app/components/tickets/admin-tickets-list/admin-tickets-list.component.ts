import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { Usuario } from '../../../models/usuario.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Area } from '../../../models/area';
import { Timestamp } from '@firebase/firestore';
import { UsersService } from '../../../services/users.service';
import { BranchesService } from '../../../services/branches.service';
import { AreasService } from '../../../services/areas.service';
import { MessageService } from 'primeng/api';
import { Categoria } from '../../../models/categoria.mdoel';
import { CategoriesService } from '../../../services/categories.service';
import { SupportTypesService } from '../../../services/support-types.service';
import { TipoSoporte } from '../../../models/tipo-soporte.model';
import { TicketsPriorityService } from '../../../services/tickets-priority.service';
import { PrioridadTicket } from '../../../models/prioridad-ticket.model';

@Component({
  selector: 'app-admin-tickets-list',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
  ],
  templateUrl: './admin-tickets-list.component.html',
  styleUrl: './admin-tickets-list.component.scss',
})
export class AdminTicketsListComponent {
  @Input() tickets: Ticket[] = [];
  sucursales: Sucursal[] = [];
  tiposSoporte: TipoSoporte[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  categorias: Categoria[] = [];
  areas: Area[] = [];
  ticket: Ticket | undefined;
  usuariosHelp: Usuario[] = [];
  ticketSeleccionado: Ticket | undefined;

  constructor(
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private supportTypesService: SupportTypesService,
    private ticketsPriorityService: TicketsPriorityService,
  ) {
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
    this.obtenerPrioridadesTicket();
    this.obtenerTiposSoporte();
    this.obtenerAreas();
    this.obtenerCategorias();
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerTiposSoporte() {
    this.supportTypesService.get().subscribe({
      next: (data) => {
        this.tiposSoporte = data;
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

  actualizaTicket(ticket: Ticket) {
    this.ticketsService
      .update(ticket)
      .then(() => {})
      .catch((error) => console.error(error));
  }

  obtenerNombreResponsable(id: string): string {
    let name = '';

    let temp = this.usuariosHelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  getDate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter((x) => x.idRol == '4');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
