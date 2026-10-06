import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';

import { Ticket } from '../../interfaces/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';
import { MiniMatrizUrgenciaComponent } from '../../../categorias/components/mini-matriz-urgencia/mini-matriz-urgencia.component';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriesService } from '../../../categorias/services/categories.service';

@Component({
  selector: 'app-requester-tickets-list',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    AccordionModule,
    BadgeModule,
    RatingStarsComponent,
    TooltipModule,
    ConfirmDialogModule,
    DropdownModule,
    FormsModule,
    TicketSlaGaugeComponent,
    MiniMatrizUrgenciaComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './requester-tickets-list.component.html',
  styleUrl: './requester-tickets-list.component.scss',
})
export class RequesterTicketsListComponent implements OnInit, OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() mostrarAccionChat: boolean = true;
  @Input() mostrarAccionPanico: boolean = true;
  @Input() mostrarAccionFinalizar: boolean = true;
  @Input() mostrarEstrellas: boolean = true;
  @Input() mostrarFedchaEstimacion: boolean = true;
  @Input() mostrarSucursal: boolean = false;
  @Input() esEspectadorActivo: boolean = false;
  @Input() mostrarFechaSolicitud: boolean = false;
  @Input() mostrarFechaTermino: boolean = false;
  @Input() mostrarDescripcion: boolean = false;

  @Output() clickEvent = new EventEmitter<Ticket>();

  showModalChatTicket: boolean = false;
  areas: Area[] = [];
  ticketSeleccionado: Ticket | undefined;
  usuario: any;
  usuariosHelp: Usuario[] = [];
  ticketAccion: Ticket | any;
  chatsSinLeer = 0;
  estatusTickets: EstatusTicket[] = [];
  sucursales: Sucursal[] = [];

  categorias: Categoria[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private usersService: UsersService,
    private confirmationService: ConfirmationService,
    private ticketsService: TicketsService,
    private areasService: AreasService,
    private statusTicketsService: StatusTicketService,
    private branchesService: BranchesService,
    private categoriesService: CategoriesService
  ) {
    this.obtenerCatalogoEstatusTickets();
    this.obtenerSucursales();
    this.obtenerCategorias();
  }

  obtenerCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerAreas();
    this.obtenerUsuariosHelp();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.observaActualizacionesChatTicket(changes);
  }

  obtenerCatalogoEstatusTickets() {
    this.statusTicketsService
      .get()
      .subscribe((result) => (this.estatusTickets = result));
  }

  observaActualizacionesChatTicket(changes: SimpleChanges) {
    if (changes['tickets'] && changes['tickets'].currentValue) {
      if (this.ticketAccion)
        this.ticketAccion = this.tickets.filter(
          (x) => x.id == this.ticketAccion.id
        )[0];
    }
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerEstatusInfo(idStatus?: string): any {
    if (!idStatus) return undefined;
    return this.estatusTickets.find(s => String(s.id) === String(idStatus));
  }

  obtenerAreas() {
    this.areasService.areas$.subscribe(areas => this.areas = areas);
  }

  onClick() {
    this.clickEvent.emit(this.ticketSeleccionado);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerNombreEstatusTicket(idEstatusTicket: string) {
    if (this.estatusTickets.length == 0) return;
    let nombre: string = this.estatusTickets.filter(
      (x) => x.id == idEstatusTicket
    )[0].nombre;

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

}
