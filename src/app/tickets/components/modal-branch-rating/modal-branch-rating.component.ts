import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { MantenimientosSistemasService } from '../../../mantenimientos/services/mantenimientos-sistemas.service';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../interfaces/ticket.model';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';


@Component({
  selector: 'app-modal-branch-rating',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, TableModule, RatingStarsComponent, TooltipModule],
  templateUrl: './modal-branch-rating.component.html',
  styleUrl: './modal-branch-rating.component.scss'
})
export class ModalBranchRatingComponent {
  @Input() mostrarModalRating: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  usuario: Usuario;
  sucursal: Sucursal;

  calificacionMantenimiento: number = 0;
  calificacion30TicketsAnalista: number = 0;
  calificacion30TicketsSupervisor: number = 0;

  constructor(
    private mantenimientosSistemasService: MantenimientosSistemasService,
    private ticketsService: TicketsService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
    if (this.sucursal) {
      this.obtenerUltimoMantenimiento();
    }

    this.obtenerUltimos30tickets();
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  obtenerUltimoMantenimiento() {
    this.mantenimientosSistemasService.getLastMaintenanceByBranch(this.sucursal.id).subscribe(result => {
      if (result) {
        this.calcularPorcentajeMantenimiento(result[0]);
      }
    })
  }

  obtenerUltimos30tickets() {
    this.ticketsService.get30LastTickets().subscribe(result => {
      this.calcularPorcentajeTicketsAnalista(result);
      this.calcularPorcentajeTicketsSupervisor(result);
    });
  }

  private calcularPorcentajeMantenimiento(mantenimiento: MantenimientoSys) {
    const totalActividades = 8;
    let completadas = 0;
    if (mantenimiento.mantenimientoCaja) completadas++;
    if (mantenimiento.mantenimientoImpresoras) completadas++;
    if (mantenimiento.mantenimientoRack) completadas++;
    if (mantenimiento.mantenimientoPuntosVentaTabletas) completadas++;
    if (mantenimiento.mantenimientoInternet) completadas++;
    if (mantenimiento.mantenimientoCCTV) completadas++;
    if (mantenimiento.mantenimientoNoBrakes) completadas++;
    if (mantenimiento.mantenimientoTiemposCocina) completadas++;

    const porcentaje = Math.round((completadas / totalActividades) * 100);
    this.calificacionMantenimiento = Math.round((porcentaje / 100) * 5);
  }

  private calcularPorcentajeTicketsAnalista(tickets: Ticket[]) {
    let total = 0;

    tickets.forEach(ticket => {
      total += ticket.calificacion;
    });

    this.calificacion30TicketsAnalista = Math.round(total / tickets.length);
  }

  private calcularPorcentajeTicketsSupervisor(tickets: Ticket[]) {
    let total = 0;
    tickets = tickets.filter(X => X.calificacionAnalista)
    tickets.forEach(ticket => {
      total += ticket.calificacionAnalista;
    });

    this.calificacion30TicketsSupervisor = Math.round(total / tickets.length);
  }
}
