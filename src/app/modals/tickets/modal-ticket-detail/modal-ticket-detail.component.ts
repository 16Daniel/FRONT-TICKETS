import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';

import { Usuario } from '../../../models/usuario.model';
import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';
import { ModalSelectSpecialistUserComponent } from '../../users/modal-select-specialist-user/modal-select-specialist-user.component';

@Component({
  selector: 'app-modal-ticket-detail',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, AccordionModule, ModalSelectSpecialistUserComponent],
  templateUrl: './modal-ticket-detail.component.html',
  styleUrl: './modal-ticket-detail.component.scss',
})
export class ModalTicketDetailComponent {
  @Input() ticket: Ticket | undefined;
  @Input() showModalTicketDetail: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  usuario: Usuario;
  mostrarModalEspecialistas: boolean = false;
  idSucursalEspecialista: string = '';

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  onClick() {
    this.actualizaTicket(this.ticket);
  }

  actualizaTicket(ticket: Ticket | any) {
    ticket.idEstatusTicket = '2';
    this.ticketsService
      .update(ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) => console.error(error));
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onClickAsignarEspecialista() {
    this.idSucursalEspecialista = this.ticket?.idSucursal;
    this.mostrarModalEspecialistas = true;
  }
}
