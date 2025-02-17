import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
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

  evidencia: string = '';
  rating: number = 0; // Calificación inicial
  // stars: boolean[] = [false, false, false, false, false]; // Estrellas desmarcadas

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService
  ) {}

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.updateStars();
  // }

  finalizarTicket() {
    this.ticket!.status = '3';
    this.ticket!.calificacion = this.rating;
    this.ticket.fechaFin = new Date();

    const ticket = this.ticket;

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
    this.evidencia = '';
  }
}
