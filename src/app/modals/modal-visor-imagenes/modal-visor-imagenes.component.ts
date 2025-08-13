import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-visor-imagenes',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-visor-imagenes.component.html',
  styleUrl: './modal-visor-imagenes.component.scss'
})
export class ModalVisorImagenesComponent {
  @Input() mostrarModal: boolean = false;
  @Input() imagenUrl: string | null = null;
  @Input() titulo: string = 'VISOR DE IMAGENES';
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
