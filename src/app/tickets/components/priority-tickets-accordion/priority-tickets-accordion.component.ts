import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { Ticket } from '../../interfaces/ticket.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { TpvsDevicesTableComponent } from '../../../sucursales/components/tpvs-devices-table/tpvs-devices-table.component';

@Component({
  selector: 'app-priority-tickets-accordion',
  standalone: true,
  imports: [
    RequesterTicketsListComponent,
    AccordionModule,
    BadgeModule,
    CommonModule,
    TooltipModule,
    TpvsDevicesTableComponent
  ],
  templateUrl: './priority-tickets-accordion.component.html',
  styleUrl: './priority-tickets-accordion.component.scss',
})
export class PriorityTicketsAccordionComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() esEspectadorActivo: boolean = false;
  @Input() mostrarTpvs: boolean = false;
  sucursal: Sucursal = new Sucursal;
  userdata: any;

  @Output() clickEvent = new EventEmitter<Ticket>();

  constructor(private branchesService: BranchesService) {

  }

  ngOnInit(): void {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.branchesService.getById(this.userdata.sucursales[0].id).subscribe(sucursal => this.sucursal = sucursal);
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }

  obtenerContadorTickets(prioridad: string): number {
    return this.obtenerTicketsFiltrados(prioridad).length;
  }

  obtenerScore(tk: Ticket | any): number {
    if (tk.score) return tk.score;
    const urg = Math.min(3, Math.max(1, tk.urgencia || 2));
    const crit = Math.min(3, Math.max(1, tk.criticidad || 2));
    return crit * urg; // For legacy 3x3 this is max 9.
  }

  obtenerPrioridadTicket(tk: Ticket | any): string {
    const score = this.obtenerScore(tk);

    // If there is an explicit string, map it
    const pStr = String(tk.prioridad || '').toUpperCase();
    if (pStr.includes('CRÍT') || pStr.includes('CRIT') || pStr.includes('PÁN')) return 'Crítico';
    if (pStr.includes('ALT')) return 'Alto';
    if (pStr.includes('MED')) return 'Medio';
    if (pStr.includes('BAJ')) return 'Bajo';

    // Map by 18-point score scale
    if (score >= 14) return 'Crítico';
    if (score >= 10) return 'Alto';
    if (score >= 6) return 'Medio';
    if (score >= 2) return 'Bajo';

    // Fallback logic for legacy 9-point scale if it wasn't caught by the explicit strings
    // In legacy 3x3: 7-9 is Crítico, 5-6 Alto, 3-4 Medio, 1-2 Bajo
    if (score >= 7) return 'Crítico';
    if (score >= 5) return 'Alto';
    if (score >= 3) return 'Medio';
    return 'Bajo';
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    // Return background colors based on the new spec
    if (value === 'Crítico') return '#FEE2E2';
    if (value === 'Alto') return '#FFEDD5';
    if (value === 'Medio') return '#FEF9C3';
    if (value === 'Bajo') return '#DCFCE7';
    return '#f8f9fa';
  }
  
  obtenerColorBordePrioridad(value: string): string {
    if (value === 'Crítico') return '#FCA5A5';
    if (value === 'Alto') return '#FDBA74';
    if (value === 'Medio') return '#FDE047';
    if (value === 'Bajo') return '#86EFAC';
    return '#dee2e6';
  }

  obtenerColorTextoPrioridad(value: string): string {
    if (value === 'Crítico') return '#991B1B';
    if (value === 'Alto') return '#9A3412';
    if (value === 'Medio') return '#854D0E';
    if (value === 'Bajo') return '#166534';
    return '#212529';
  }

  obtenerTicketsFiltrados(prioridad: string): Ticket[] {
    return this.tickets.filter((tk) => this.obtenerPrioridadTicket(tk) === prioridad);
  }

  verificarTicketsPorValidar(tickets: Ticket[]) {
    let result = tickets.filter(x => x.idEstatusTicket == '7');
    return result.length > 0;
  }

}
