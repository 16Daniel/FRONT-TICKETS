import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-final-comments',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, AccordionModule],
  templateUrl: './modal-final-comments.component.html',
  styleUrl: './modal-final-comments.component.scss'
})
export class ModalFinalCommentsComponent {
  @Input() mantenimiento: any;
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
