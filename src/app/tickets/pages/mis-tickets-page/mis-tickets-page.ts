import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RequesterTicketsListComponent } from '../../components/requester-tickets-list/requester-tickets-list.component';
import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';

@Component({
  selector: 'app-mis-tickets-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    PageHeaderComponent,
    RequesterTicketsListComponent,
    DetalleTicketDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mis-tickets-page.html',
  styleUrl: './mis-tickets-page.scss',
})
export default class MisTicketsPageComponent implements OnInit, OnDestroy {
  usuario!: Usuario;
  todosLosTickets: Ticket[] = [];
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | undefined;
  mostrarModalTicketDetail: boolean = false;
  loading: boolean = false;
  filtroTexto: string = '';

  private subscripcionTickets?: Subscription;

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef
  ) {
    const rawUserData = localStorage.getItem('rwuserdatatk');
    if (rawUserData) {
      try {
        this.usuario = JSON.parse(rawUserData);
      } catch (e) {
        console.error('Error al parsear usuario de localStorage:', e);
      }
    }
  }

  ngOnInit(): void {
    this.obtenerMisTickets();
  }

  ngOnDestroy(): void {
    this.subscripcionTickets?.unsubscribe();
  }

  obtenerMisTickets(): void {
    if (!this.usuario?.id) return;

    this.loading = true;
    this.subscripcionTickets = this.ticketsService
      .getTicketsPorUsuario(this.usuario.id)
      .subscribe({
        next: (data) => {
          this.todosLosTickets = this.ordenarTickets(data);
          this.aplicarFiltro();

          if (this.ticketSeleccionado) {
            const temp = this.todosLosTickets.filter((x) => x.id === this.ticketSeleccionado!.id);
            if (temp.length > 0) {
              this.ticketSeleccionado = temp[0];
            }
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al obtener los tickets del usuario:', error);
          this.cdr.detectChanges();
        },
      });
  }

  aplicarFiltro(): void {
    const txt = (this.filtroTexto || '').trim().toLowerCase();
    if (!txt) {
      this.tickets = [...this.todosLosTickets];
    } else {
      this.tickets = this.todosLosTickets.filter((t) =>
        (t.folio && String(t.folio).toLowerCase().includes(txt)) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(txt)) ||
        (t.nombreCategoria && t.nombreCategoria.toLowerCase().includes(txt)) ||
        (t.nombreSubcategoria && t.nombreSubcategoria.toLowerCase().includes(txt)) ||
        (t.solicitante && t.solicitante.toLowerCase().includes(txt))
      );
    }
    this.cdr.detectChanges();
  }

  abrirModalDetalleTicket(ticket: Ticket | any): void {
    this.ticketSeleccionado = ticket;
    this.mostrarModalTicketDetail = true;
  }

  private ordenarTickets(tickets: Ticket[]): Ticket[] {
    return [...tickets].sort((a, b) => {
      const scoreA =
        (a as any).score ||
        ((a as any).criticidad && (a as any).urgencia
          ? (a as any).criticidad * (a as any).urgencia
          : 4);
      const scoreB =
        (b as any).score ||
        ((b as any).criticidad && (b as any).urgencia
          ? (b as any).criticidad * (b as any).urgencia
          : 4);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      const timeA = a.fecha?.toDate
        ? a.fecha.toDate().getTime()
        : a.fecha
          ? new Date(a.fecha).getTime()
          : 0;
      const timeB = b.fecha?.toDate
        ? b.fecha.toDate().getTime()
        : b.fecha
          ? new Date(b.fecha).getTime()
          : 0;
      return timeB - timeA;
    });
  }
}
