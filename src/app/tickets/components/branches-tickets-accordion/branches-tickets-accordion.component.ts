import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
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
import { NivelesAudioComponent } from '../../../mantenimientos/components/niveles-audio/niveles-audio.component';
import { TpvsDevicesTableComponent } from '../tpvs-devices-table/tpvs-devices-table.component';
import { GraficaTickets30DiasComponent } from '../../../mantenimientos/components/grafica-tickets-30-dias/grafica-tickets-30-dias.component';
import { Ticket } from '../../interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { TablaTvsBocinasComponent } from "../../../mantenimientos/components/tabla-tvs-bocinas/tabla-tvs-bocinas.component";

@Component({
  selector: 'app-branches-tickets-accordion',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
    AdminTicketsListComponent,
    TooltipModule,
    TpvsDevicesTableComponent,
    GraficaTickets30DiasComponent,
    TablaTvsBocinasComponent,
    NivelesAudioComponent
],
  templateUrl: './branches-tickets-accordion.component.html',
  styleUrl: './branches-tickets-accordion.component.scss',
})

export class BranchesTicketsAccordionComponent {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() idArea: string = '';
  @Input() mostrarTpvs: boolean = false;
  areas: Area[] = [];
  ticket: Ticket | undefined;
  usuariosHelp: Usuario[] = [];
  usuario: Usuario | any;
  ticketSeleccionado: Ticket | undefined;
  mostrarRadiografiaMap: { [idSucursal: string]: boolean } = {};
  mostrarSistemasMap: { [idSucursal: string]: boolean } = {};
  mostrarAudioVideoMap: { [idSucursal: string]: boolean } = {};

  constructor(
    private firebaseStorage: FirebaseStorageService,
    private branchesService: BranchesService
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursales.forEach(s => {
      this.mostrarRadiografiaMap[s.id] = false;
      this.mostrarSistemasMap[s.id] = false;
      this.mostrarAudioVideoMap[s.id] = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sucursales']) {
      this.sucursales = this.ordenarSucursales();
    }
  }

  ordenarSucursales(): Sucursal[] {
    return this.sucursales.sort((a, b) => {
      const ticketsA = this.obtenerScoreMaximoSucursal(a.id);
      const ticketsB = this.obtenerScoreMaximoSucursal(b.id);
      return ticketsB - ticketsA;
    });
  }

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  contarTickets(idSucursal: number | any): number {
    return this.tickets.filter((x) => x.idSucursal == idSucursal && x.idEstatusTicket != '3').length;
  }

  obtenerScoreMaximoSucursal(idSucursal: number | any): number {
    const ticketsAbiertos = this.tickets.filter(x => x.idSucursal == idSucursal && x.idEstatusTicket != '3');
    if (ticketsAbiertos.length === 0) return 0;
    return Math.max(...ticketsAbiertos.map(t => t.score || 0));
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

  get mostrarTickets() {
    return (id: string): boolean => {
      return !this.mostrarRadiografiaMap[id];
    };
  }


  obtenerColorTexto(value: number): string {
    return ''; // Deprecated
  }

  obtenerClaseEstado(score: number): string {
    if (score >= 14) return 'score-critico';
    if (score >= 10) return 'score-alto';
    if (score >= 6) return 'score-medio';
    if (score >= 1) return 'score-bajo';
    return 'score-neutral';
  }

  obtenerBackGroundAcordion(value: number): string {
    return ''; // Deprecated
  }

  verificarTicketsNuevos(tickets: Ticket[]): boolean {
    let nuevosTickets = tickets.filter(x => x.idEstatusTicket == '1');
    return nuevosTickets.length > 0;
  }

  verificarChatNoLeido(tickets: Ticket[]): boolean {
    return tickets.some(ticket => {
      const participantes = ticket.participantesChat.sort((a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido);
      const participante = participantes.find((p) => p.idUsuario === this.usuario.id);

      if (participante) {
        const ultimoComentarioLeido = participante.ultimoComentarioLeido;
        const comentarios = ticket.comentarios;

        return comentarios.length > ultimoComentarioLeido; // Si hay al menos 1 chat sin leer, devuelve true
      }

      return false;
    });
  }

  verificarTicketsPendientesValidar = (tickets: Ticket[]) =>
    tickets.filter(x => x.validacionAdmin == false && x.idEstatusTicket == '3').length > 0;

}
