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
import { DocumentsService } from '../../../services/documents.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-modal-finalize-ticket',
  standalone: true,
  imports: [EditorModule, CommonModule, DialogModule, FormsModule],
  templateUrl: './modal-finalize-ticket.component.html',
  styleUrl: './modal-finalize-ticket.component.scss',
})
export class ModalFinalizeTicketComponent implements OnChanges {
  @Input() showModalFinalizeTicket: boolean = false;
  @Input() ticket: Ticket | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  evidencia: string = '';
  rating: number = 0; // Calificación inicial
  stars: boolean[] = [false, false, false, false, false]; // Estrellas desmarcadas

  constructor(
    private ticketsService: TicketsService,
    private documentsService: DocumentsService,
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updateStars();
  }

  updateStars() {
    this.stars = this.stars.map((_, index) => index < this.rating);
  }

  setRating(index: number) {
    this.rating = index + 1;
    this.updateStars();
  }

  finalizarTicket() {
    this.ticket!.status = '3';
    this.ticket!.calificacion = this.rating;
    const ticket = this.ticket;

    this.ticketsService
      .updateTicket(this.ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let tk = {
          Idtk: ticket!.id,
          Fecha: this.getdate(ticket!.fecha),
          IdSuc: ticket!.idsucordpto,
          Statussuc: ticket!.statusSuc,
          Idprov: ticket!.idproveedor,
          Idcat: ticket!.idcategoria,
          Descripcion: ticket!.decripcion,
          Solicitante: ticket!.solicitante,
          Prioridadsuc: ticket!.prioridadsuc,
          Prioridadprov: ticket!.prioridadProv,
          Status: '3',
          Responsable: ticket!.responsable,
          FechaFin: new Date(),
          Duracion: '',
          Tiposoporte: ticket!.tiposoporte,
          Iduser: ticket!.iduser,
          Comentarios: JSON.stringify(ticket!.comentarios),
          Nombrecategoria: ticket!.nombreCategoria,
          Comentariosfinales: this.evidencia,
          calificacion: this.rating
        };

        this.ticketsService.AddTkSQL(tk).subscribe({
          next: () => {
            this.documentsService.deleteDocument('tickets', ticket!.id);
            this.ticket = undefined;
            this.closeEvent.emit(false); // Cerrar modal
            this.evidencia = '';
          },
          error: (error) => {
            console.log(error);
            this.showMessage(
              'error',
              'Error',
              'Error al procesar la solicitud'
            );
          },
        });
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
