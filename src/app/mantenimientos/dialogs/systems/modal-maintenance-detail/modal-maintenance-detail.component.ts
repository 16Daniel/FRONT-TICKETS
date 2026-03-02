import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MantenimientoSys } from '../../../interfaces/mantenimiento-sys.interface';

@Component({
  selector: 'app-modal-maintenance-detail',
  standalone: true,
  imports: [DialogModule, CommonModule, FormsModule],
  templateUrl: './modal-maintenance-detail.component.html',
  styleUrl: './modal-maintenance-detail.component.scss'
})
export class ModalMaintenanceDetailComponent {
  @Input() mantenimiento: MantenimientoSys | undefined;
  @Input() mostrarModalDetalleMantenimeinto: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
