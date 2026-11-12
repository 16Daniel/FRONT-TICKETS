import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';

import { AdminTicketsListComponent } from '../admin-tickets-list/admin-tickets-list.component';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Ticket } from '../../interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

@Component({
  selector: 'app-acordeon-tickets-por-sucursal',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
    AdminTicketsListComponent,
    TooltipModule
  ],
  templateUrl: './acordeon-tickets-por-sucursal.component.html',
  styleUrl: './acordeon-tickets-por-sucursal.component.scss',
})
export class AcordeonTicketsPorSucursalComponent implements OnInit, OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() idArea: string = '';
  @Input() escomite: boolean = false;

  areas: Area[] = [];
  ticket: Ticket | undefined;
  usuariosHelp: Usuario[] = [];
  usuario: Usuario | any;
  ticketSeleccionado: Ticket | undefined;

  constructor(
    private firebaseStorage: FirebaseStorageService,
    private branchesService: BranchesService
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sucursales']) {
      this.sucursales = this.ordenarSucursales();
    }
  }

  ordenarSucursales(): Sucursal[] {
    return this.sucursales.sort((a, b) => {
      const ticketsA = this.contarTickets(a.id);
      const ticketsB = this.contarTickets(b.id);
      return ticketsB - ticketsA;
    });
  }

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  contarTickets(idSucursal: number | any): number {
    return this.tickets.filter((x) => x.idSucursal == idSucursal && x.idEstatusTicket != '3').length;
  }

  obtenerResponsablesUC(idSucursal: string): string {
    let idr = '';
    for (let item of this.usuariosHelp) {
      const existeSucursal = item.sucursales.some(
        (sucursal) => sucursal.id == idSucursal
      );
      if (existeSucursal) {
        idr = item.nombre + ' ' + item.apellidoP;
      }
    }

    return idr;
  }

  obtenerColorTexto(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#fff';
    }

    if (value > 0 && value <= 4) {
      str = '#000';
    }

    if (value == 0) {
      str = '#fff';
    }

    return str;
  }

  obtenerClaseEstado(value: number): string {
    if (value >= 5) return 'status-critical';
    if (value > 0 && value <= 4) return 'status-warning';
    return 'status-success';
  }

  obtenerBackGroundAcordion(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#ff0000';
    }

    if (value > 0 && value <= 4) {
      str = '#ffe800';
    }

    if (value == 0) {
      str = '#00a312';
    }

    return str;
  }

  verificarTicketsNuevos(tickets: Ticket[]): boolean {
    let nuevosTickets = tickets.filter(x => x.idEstatusTicket == '1');
    return nuevosTickets.length > 0;
  }

  verificarTicketsPendientesValidar = (tickets: Ticket[]) =>
    tickets.filter(x => x.validacionAdmin == false && x.idEstatusTicket == '3').length > 0;
}
