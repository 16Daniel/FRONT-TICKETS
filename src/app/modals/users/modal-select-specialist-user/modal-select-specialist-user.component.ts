import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Usuario } from '../../../models/usuario.model';
import { UsersService } from '../../../services/users.service';
import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-modal-select-specialist-user',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule],
  templateUrl: './modal-select-specialist-user.component.html',
  styleUrl: './modal-select-specialist-user.component.scss'
})
export class ModalSelectSpecialistUserComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() idSucursal: string = '';
  @Input() ticket: Ticket = new Ticket;
  @Output() closeEvent = new EventEmitter<boolean>();

  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | undefined;

  constructor(
    private usuersService: UsersService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private ticketsService: TicketsService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.obtenerEspecialistas();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  obtenerEspecialistas() {
    this.usuersService.getUsuariosEspecialistas(this.idSucursal)
      .subscribe(result => {
        this.usuarios = result;
        this.cdr.detectChanges();
      });
  }

  onSeleccionarUsuario() {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'Deseas reasignar el ticket a este especialista?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.ticket.idUsuarioEspecialista = this.usuarioSeleccionado?.id!
        this.ticket.esAsignadoEspecialista = true;
        this.ticket.idResponsables.push(this.ticket.idUsuarioEspecialista);
        this.ticket.participantesChat.push({
          idUsuario: this.ticket.idUsuarioEspecialista,
          ultimoComentarioLeido: 0,
        });

        this.ticketsService
          .update(this.ticket)
          .then(() => {
            this.showMessage('success', 'Success', 'Enviado correctamente');
          })
          .catch((error) => console.error(error));
      },
      reject: () => { },
    });

    this.onHide();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
