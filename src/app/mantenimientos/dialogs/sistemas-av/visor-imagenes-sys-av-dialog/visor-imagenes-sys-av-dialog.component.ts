import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { Dispositivo } from '../../../../activos-fijos/interfaces/dispositivo.interface';

export interface EvidenciaSysAv {
  evidenciaUrls?: string[];
  dispositivo: Dispositivo;
}

@Component({
  selector: 'app-visor-imagenes-sys-av-dialog',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './visor-imagenes-sys-av-dialog.component.html',
  styleUrls: ['./visor-imagenes-sys-av-dialog.component.scss']
})
export class VisorImagenesSysAvComponent {

  @Input() mostrarModal: boolean = false;
  @Input() mostrarBotonEliminar: boolean = false;

  /** modo viejo */
  @Input() imagenesPorDispositivo: string[][] = [];

  /** modo nuevo */
  @Input() evidencias: EvidenciaSysAv[] = [];

  @Input() titulo: string = 'VISOR DE IMÁGENES';

  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() imagenEliminadaEvent = new EventEmitter<{ url: string; titulo: string, dispositivoIndex: number }>();

  dispositivoIndex: number = 0;
  imagenSeleccionadaIndex: number = 0;

  onHide = () => this.closeEvent.emit();

  /** Detecta si estamos usando evidencias */
  get usandoEvidencias(): boolean {
    return this.evidencias && this.evidencias.length > 0;
  }

  /** Lista de dispositivos para el selector */
  get dispositivos(): any[] {
    if (this.usandoEvidencias) return this.evidencias;
    return this.imagenesPorDispositivo;
  }

  /** Imágenes del dispositivo actual */
  get imagenes(): string[] {

    if (this.usandoEvidencias) {
      return this.evidencias[this.dispositivoIndex]?.evidenciaUrls || [];
    }

    return this.imagenesPorDispositivo[this.dispositivoIndex] || [];
  }

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

    if (this.imagenes.length === 0) return;

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
          titulo: this.titulo,
          dispositivoIndex: this.dispositivoIndex
        });

        let lista: string[] | undefined;

        if (this.usandoEvidencias) {
          lista = this.evidencias[this.dispositivoIndex]?.evidenciaUrls;
        } else {
          lista = this.imagenesPorDispositivo[this.dispositivoIndex];
        }

        if (!lista) return;

        lista.splice(this.imagenSeleccionadaIndex, 1);

        if (this.imagenSeleccionadaIndex >= lista.length) {
          this.imagenSeleccionadaIndex = Math.max(0, lista.length - 1);
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
