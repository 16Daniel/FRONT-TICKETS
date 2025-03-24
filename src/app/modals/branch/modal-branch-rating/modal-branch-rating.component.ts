import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-branch-rating',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule],
  templateUrl: './modal-branch-rating.component.html',
  styleUrl: './modal-branch-rating.component.scss'
})
export class ModalBranchRatingComponent {
  @Input() mostrarModalRating: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
