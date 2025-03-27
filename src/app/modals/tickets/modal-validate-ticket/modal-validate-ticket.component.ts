import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

import { RatingStarsComponent } from '../../../components/common/rating-stars/rating-stars.component';
import { Ticket } from '../../../models/ticket.model';
import { Usuario } from '../../../models/usuario.model';
import { TicketsService } from '../../../services/tickets.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-modal-validate-ticket',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, RatingStarsComponent],
  templateUrl: './modal-validate-ticket.component.html',
  styleUrl: './modal-validate-ticket.component.scss'
})

export class ModalValidateTicketComponent {
  @Input() mostrarModalValidarTicket: boolean = false;
  @Input() ticket: Ticket | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  rating: number = 0; // Calificación inicial
  usuario: Usuario;

  constructor(private ticketsService: TicketsService, private messageService: MessageService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  validarTicket() {
    this.ticket.idEstatusTicket = '7';
    this.ticket.idResponsableFinaliza = this.usuario.id;
    this.ticket!.calificacionAnalista = this.rating;

    this.ticketsService
      .update(this.ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
        this.closeEvent.emit(false);
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
