import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-visor-varias-imagenes',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-visor-varias-imagenes.component.html',
  styleUrl: './modal-visor-varias-imagenes.component.scss'
})
export class ModalVisorVariasImagenesComponent {
  @Input() mostrarModal: boolean = false;
  @Input() imagenes: string[] = []; // ✅ ahora recibe varias imágenes
  @Input() titulo: string = 'VISOR DE IMÁGENES';
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenSeleccionadaIndex: number = 0; // índice actual

  onHide() {
    this.closeEvent.emit(); // cerrar modal
  }

  get imagenActual(): string {
    return this.imagenes[this.imagenSeleccionadaIndex] ||
      'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionadaIndex = index;
  }

  siguiente() {
    if (this.imagenSeleccionadaIndex < this.imagenes.length - 1) {
      this.imagenSeleccionadaIndex++;
    }
  }

  anterior() {
    if (this.imagenSeleccionadaIndex > 0) {
      this.imagenSeleccionadaIndex--;
    }
  }
}
