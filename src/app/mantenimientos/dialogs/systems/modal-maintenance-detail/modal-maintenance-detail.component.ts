import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mantenimiento10x10 } from '../../../interfaces/mantenimiento-10x10.model';

@Component({
  selector: 'app-modal-maintenance-detail',
  standalone: true,
  imports: [DialogModule, CommonModule, FormsModule],
  templateUrl: './modal-maintenance-detail.component.html',
  styleUrl: './modal-maintenance-detail.component.scss'
})
export class ModalMaintenanceDetailComponent {
  @Input() mantenimiento: Mantenimiento10x10 | undefined;
  @Input() mostrarModalDetalleMantenimeinto: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
