import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TicketsService } from '../../../services/tickets.service';
import { Usuario } from '../../../models/usuario.model';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Ticket } from '../../../models/ticket.model';
import { TooltipModule } from 'primeng/tooltip';
import { Timestamp } from '@angular/fire/firestore';
import { EstatusTicket } from '../../../models/estatus-ticket.model';
import { StatusTicketService } from '../../../services/status-ticket.service';
import { Area } from '../../../models/area.model';
import { AreasService } from '../../../services/areas.service';
import { MessageService } from 'primeng/api';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { UsersService } from '../../../services/users.service';
import { ModalTicketDetailComponent } from '../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';

@Component({
  selector: 'app-specialist-home',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule, ModalTicketDetailComponent],
  providers: [MessageService],
  templateUrl: './specialist-home.component.html',
  styleUrl: './specialist-home.component.scss'
})
export default class SpecialistHomeComponent implements OnInit {
  usuario: Usuario;
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket = new Ticket;
  estatusTickets: EstatusTicket[] = [];
  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  ticket: Ticket | undefined;
  mostrarModalTicketDetail: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private statusTicketsService: StatusTicketService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private branchesService: BranchesService,
    private usersService: UsersService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.getTicketsPorEspecialista();
    this.obtenerCatalogoEstatusTickets();
    this.obtenerAreas();
    this.obtenerCatalogoEstatusTickets();
    this.obtenerSucursales();
    this.obtenerUsuariosHelp();
  }

  getTicketsPorEspecialista() {
    this.ticketsService.getTicketsPorEspecialista(this.usuario.id)
      .subscribe(result => {
        this.tickets = result;
        this.cdr.detectChanges()
      });
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  obtenerNombreEstatusTicket(idEstatusTicket: string) {
    if (this.estatusTickets.length == 0) return;
    let nombre: string = this.estatusTickets.filter(
      (x) => x.id == idEstatusTicket
    )[0].nombre;

    return nombre;
  }

  obtenerCatalogoEstatusTickets() {
    this.statusTicketsService
      .get()
      .subscribe((result) => (this.estatusTickets = result));
  }

  obtenerNombreArea(idArea: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idArea);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
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

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
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

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
}
