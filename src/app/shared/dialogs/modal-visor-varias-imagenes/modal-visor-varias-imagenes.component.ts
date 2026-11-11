import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-visor-varias-imagenes',
  standalone: true,
  imports: [DialogModule, CommonModule, TooltipModule],
  templateUrl: './modal-visor-varias-imagenes.component.html',
  styleUrls: ['./modal-visor-varias-imagenes.component.scss']
})
export class ModalVisorVariasImagenesComponent {
  private _mostrarModal: boolean = false;
  @Input() set mostrarModal(val: boolean) {
    this._mostrarModal = val;
    if (val) {
      this.imagenSeleccionadaIndex = 0;
      this.resetTransform();
    }
  }
  get mostrarModal(): boolean {
    return this._mostrarModal;
  }
  @Output() mostrarModalChange = new EventEmitter<boolean>();

  @Input() mostrarBotonEliminar: boolean = false;
  @Input() imagenes: string[] = [];
  @Input() titulo: string = 'VISOR DE IMÁGENES';

  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() imagenEliminadaEvent = new EventEmitter<{ url: string; titulo: string }>();

  imagenSeleccionadaIndex: number = 0;
  zoom: number = 1;
  rotacion: number = 0;

  // Variables para navegación por gestos táctiles (Swipe)
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.mostrarModal) return;
    if (event.key === 'ArrowRight') {
      this.siguiente();
    } else if (event.key === 'ArrowLeft') {
      this.anterior();
    } else if (event.key === '+' || event.key === '=') {
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
    } else if (event.key === 'r' || event.key === 'R') {
      this.rotar();
    } else if (event.key === '0') {
      this.resetTransform();
    } else if (event.key === 'Escape') {
      this.onHide();
    }
  }

  onHide() {
    this.resetTransform();
    this.mostrarModal = false;
    this.mostrarModalChange.emit(false);
    this.closeEvent.emit(false);
  }

  get imagenActual(): string {
    return this.imagenes?.[this.imagenSeleccionadaIndex] || '';
  }

  seleccionarImagen(index: number) {
    if (this.imagenSeleccionadaIndex !== index) {
      this.imagenSeleccionadaIndex = index;
      this.resetTransform();
    }
  }

  siguiente() {
    if (this.imagenSeleccionadaIndex < this.imagenes.length - 1) {
      this.imagenSeleccionadaIndex++;
      this.resetTransform();
    }
  }

  anterior() {
    if (this.imagenSeleccionadaIndex > 0) {
      this.imagenSeleccionadaIndex--;
      this.resetTransform();
    }
  }

  zoomIn() {
    if (this.zoom < 3) {
      this.zoom = Number((this.zoom + 0.25).toFixed(2));
    }
  }

  zoomOut() {
    if (this.zoom > 0.5) {
      this.zoom = Number((this.zoom - 0.25).toFixed(2));
    }
  }

  rotar() {
    this.rotacion = (this.rotacion + 90) % 360;
  }

  resetTransform() {
    this.zoom = 1;
    this.rotacion = 0;
  }

  abrirEnNuevaPestana() {
    if (this.imagenActual) {
      window.open(this.imagenActual, '_blank');
    }
  }

  descargarImagen() {
    if (!this.imagenActual) return;
    const link = document.createElement('a');
    link.href = this.imagenActual;
    link.target = '_blank';
    link.download = `evidencia-${this.titulo || 'imagen'}-${this.imagenSeleccionadaIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  eliminarImagen() {
    if (!this.imagenes || this.imagenes.length === 0) return;
    const urlEliminada = this.imagenActual;

    Swal.fire({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d3152a',
      cancelButtonColor: '#475569',
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
        this.resetTransform();

        Swal.fire({
          title: 'Eliminada',
          text: 'La imagen ha sido eliminada con éxito.',
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
          customClass: {
            container: 'swal-topmost'
          }
        });
      }
    });
  }

  // Soporte para gestos táctiles (Swipe Izquierda / Derecha)
  onTouchStart(event: TouchEvent) {
    if (event.touches && event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (event.changedTouches && event.changedTouches.length === 1) {
      const deltaX = event.changedTouches[0].clientX - this.touchStartX;
      const deltaY = event.changedTouches[0].clientY - this.touchStartY;
      // Umbral horizontal para cambiar imagen: > 45px y que no sea un scroll vertical predominante
      if (Math.abs(deltaX) > 45 && Math.abs(deltaY) < 70) {
        if (deltaX < 0) {
          this.siguiente();
        } else {
          this.anterior();
        }
      }
    }
  }
}
