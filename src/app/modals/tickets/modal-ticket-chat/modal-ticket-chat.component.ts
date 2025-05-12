import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';

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
export class ModalTicketChatComponent implements AfterViewChecked, OnInit {
  @Input() showModalChatTicket: boolean = false;
  @Input() ticket: Ticket | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  @ViewChild('chatContainer') private chatContainer: any;

  userdata: any;
  comentario: string = '';

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.ticketsService.updateLastCommentRead(
      this.ticket.id,
      this.userdata.id,
      this.ticket.comentarios.length
    );
  }

  esmiId(id: string): boolean {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.id;
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

    let idu = this.userdata.id;

    let data = {
      nombre: this.userdata.nombre + ' ' + this.userdata.apellidoP,
      idUsuario: idu,
      comentario: this.comentario,
      fecha: new Date(),
    };
    this.ticket!.comentarios.push(data);

    this.ticketsService
      .update(this.ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
        this.comentario = '';

        this.ticketsService.updateLastCommentRead(
          this.ticket.id,
          this.userdata.id,
          this.ticket.comentarios.length
        );

      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  // Detecta cuando el componente ha sido actualizado
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // Método para hacer scroll hacia abajo
  private scrollToBottom(): void {
    if (this.chatContainer) {
      // Desplazarse hacia abajo del contenedor
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    }
  }

  getDate(tsmp: Timestamp | Date): Date {
     if (tsmp instanceof Date) {
        return tsmp;
    } else
    {
         const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date; 
    }
  }
}
