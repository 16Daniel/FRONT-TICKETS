import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { TicketDB } from '../../../models/ticket-db.model';
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
export class ModalFinalizeTicketComponent {
  @Input() showModalFinalizeTicket: boolean = false;
  @Input() ticket: TicketDB | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  evidencia: string = '';

  constructor(
    private ticketsService: TicketsService,
    private documentsService: DocumentsService,
    private messageService: MessageService
  ) {}

  finalizarTicket() {
    this.ticket!.status = '3';
    this.ticketsService
      .updateTicket(this.ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let tk = {
          Idtk: this.ticket!.id,
          Fecha: this.getdate(this.ticket!.fecha),
          IdSuc: this.ticket!.idsucordpto,
          Statussuc: this.ticket!.statusSuc,
          Idprov: this.ticket!.idproveedor,
          Idcat: this.ticket!.idcategoria,
          Descripcion: this.ticket!.decripcion,
          Solicitante: this.ticket!.solicitante,
          Prioridadsuc: this.ticket!.prioridadsuc,
          Prioridadprov: this.ticket!.prioridadProv,
          Status: '3',
          Responsable: this.ticket!.responsable,
          FechaFin: new Date(),
          Duracion: '',
          Tiposoporte: this.ticket!.tiposoporte,
          Iduser: this.ticket!.iduser,
          Comentarios: JSON.stringify(this.ticket!.comentarios),
          Nombrecategoria: this.ticket!.nombreCategoria,
          Comentariosfinales: this.evidencia,
        };

        this.ticketsService.AddTkSQL(tk).subscribe({
          next: (data) => {
            this.documentsService.deleteDocument('tickets', this.ticket!.id);
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
