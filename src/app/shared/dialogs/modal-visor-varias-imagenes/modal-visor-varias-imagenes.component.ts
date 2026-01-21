import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-visor-varias-imagenes',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-visor-varias-imagenes.component.html',
  styleUrls: ['./modal-visor-varias-imagenes.component.scss']
})
export class ModalVisorVariasImagenesComponent {
  @Input() mostrarModal: boolean = false;
  @Input() mostrarBotonEliminar: boolean = false;
  @Input() imagenes: string[] = [];
  @Input() titulo: string = 'VISOR DE IMÁGENES';
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() imagenEliminadaEvent = new EventEmitter<{ url: string; titulo: string }>();

  imagenSeleccionadaIndex: number = 0;

  onHide = () => this.closeEvent.emit();

  get imagenActual(): string {
    return (
      this.imagenes[this.imagenSeleccionadaIndex] ||
      'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
    );
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

  eliminarImagen() {
    if (!this.imagenes || this.imagenes.length === 0) return;

    const urlEliminada = this.imagenActual;

    Swal.fire({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      }
    }).then((result) => {
      if (result.isConfirmed) {

        this.imagenEliminadaEvent.emit({
          url: urlEliminada,
          titulo: this.titulo
        });

        this.imagenes.splice(this.imagenSeleccionadaIndex, 1);

        if (this.imagenSeleccionadaIndex >= this.imagenes.length) {
          this.imagenSeleccionadaIndex = Math.max(0, this.imagenes.length - 1);
        }

        Swal.fire({
          title: 'Eliminada',
          text: 'La imagen ha sido eliminada.',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          customClass: {
            container: 'swal-topmost'
          }
        });
      }
    });
  }

}
