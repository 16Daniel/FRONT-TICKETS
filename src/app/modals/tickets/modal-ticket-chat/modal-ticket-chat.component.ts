import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TicketDB } from '../../../models/ticket-db.model';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TicketsService } from '../../../services/tickets.service';
import { MessageService } from 'primeng/api';
import { Notificacion } from '../../../models/notificacion.model';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'app-modal-ticket-chat',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    CommonModule,
    EditorModule,
    DialogModule,
    InputTextModule,
  ],
  templateUrl: './modal-ticket-chat.component.html',
  styleUrl: './modal-ticket-chat.component.scss',
})
export class ModalTicketChatComponent {
  @Input() showModalChatTicket: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  
  @Input() ticket: TicketDB | any;
  userdata: any;
  comentario: string = '';

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private notificationsService: NotificationsService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  esmiuid(id: string): boolean {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;
    if (id == idu) {
      st = true;
    }
    return st;
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  enviarComentarioChat() {
    if (!this.comentario) {
      return;
    }
    
    let idu = this.userdata.uid;

    let data = {
      nombre: this.userdata.nombre + ' ' + this.userdata.apellidoP,
      uid: idu,
      comentario: this.comentario,
      fecha: new Date(),
    };
    this.ticket!.comentarios.push(data);

    this.ticketsService
      .updateTicket(this.ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let dataNot: Notificacion = {
          titulo: 'NUEVO COMENTARIO',
          mensaje: 'HAY UN NUEVO COMENTARIO PARA EL TICKET: ' + this.ticket!.id,
          uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
          fecha: new Date(),
          abierta: false,
          idtk: this.ticket!.id,
          notificado: false,
        };

        let idn = this.notificationsService.addNotifiacion(dataNot);

        this.comentario = '';
        // this.closeEvent.emit(false); // Cerrar modal
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
