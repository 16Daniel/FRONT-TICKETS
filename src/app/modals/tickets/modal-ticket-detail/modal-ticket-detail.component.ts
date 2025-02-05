import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TicketDB } from '../../../models/ticket-db.model';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-ticket-detail',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './modal-ticket-detail.component.html',
  styleUrl: './modal-ticket-detail.component.scss',
})
export class ModalTicketDetailComponent {
  @Input() ticket: TicketDB | undefined;
  @Input() showModalTicketDetail: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
