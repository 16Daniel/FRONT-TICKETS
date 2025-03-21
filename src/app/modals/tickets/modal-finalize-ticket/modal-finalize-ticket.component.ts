import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { MessageService } from 'primeng/api';

import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { RatingStarsComponent } from '../../../components/common/rating-stars/rating-stars.component';

@Component({
  selector: 'app-modal-finalize-ticket',
  standalone: true,
  imports: [
    EditorModule,
    CommonModule,
    DialogModule,
    FormsModule,
    RatingStarsComponent,
  ],
  templateUrl: './modal-finalize-ticket.component.html',
  styleUrl: './modal-finalize-ticket.component.scss',
})

export class ModalFinalizeTicketComponent {
  @Input() showModalFinalizeTicket: boolean = false;
  @Input() ticket: Ticket | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  // evidencia: string = '';
  rating: number = 0; // Calificación inicial

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService
  ) {}

  finalizarTicket() {
    this.ticket!.idEstatusTicket = '3';
    this.ticket!.calificacion = this.rating;
    this.ticket.fechaFin = new Date();
console.log(this.ticket.comentariosFinales)
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

  getdate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
    // this.evidencia = '';
  }
}
