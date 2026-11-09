import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { Dispositivo } from '../../../../activos-fijos/interfaces/dispositivo.interface';

export interface EvidenciaSysAv {
  evidenciaUrls?: string[];
  dispositivo: Dispositivo;
}

@Component({
  selector: 'app-visor-imagenes-sys-av-dialog',
  standalone: true,
  imports: [DialogModule, CommonModule, TooltipModule],
  templateUrl: './visor-imagenes-sys-av-dialog.component.html',
  styleUrls: ['./visor-imagenes-sys-av-dialog.component.scss']
})
export class VisorImagenesSysAvComponent {
  private _mostrarModal: boolean = false;
  @Input() set mostrarModal(val: boolean) {
    this._mostrarModal = val;
    if (val) {
      // En dispositivos móviles (<= 768px), iniciar con la ficha técnica colapsada
      // para que la imagen sea el foco principal y no quede tapada
      const esMovil = typeof window !== 'undefined' && window.innerWidth <= 768;
      this.mostrarDetalles = !esMovil;
      this.dispositivoIndex = 0;
      this.imagenSeleccionadaIndex = 0;
      this.resetTransform();
    }
  }
  get mostrarModal(): boolean {
    return this._mostrarModal;
  }
  @Output() mostrarModalChange = new EventEmitter<boolean>();

  @Input() mostrarBotonEliminar: boolean = false;

  /** modo viejo */
  @Input() imagenesPorDispositivo: string[][] = [];

  /** modo nuevo */
  private _evidencias: EvidenciaSysAv[] = [];
  @Input() set evidencias(val: EvidenciaSysAv[]) {
    this._evidencias = val || [];
    this.dispositivoIndex = 0;
    this.imagenSeleccionadaIndex = 0;
  }
  get evidencias(): EvidenciaSysAv[] {
    return this._evidencias;
  }

  @Input() titulo: string = 'VISOR DE IMÁGENES';

  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() imagenEliminadaEvent = new EventEmitter<{ url: string; titulo: string; dispositivoIndex: number }>();

  dispositivoIndex: number = 0;
  imagenSeleccionadaIndex: number = 0;
  zoom: number = 1;
  rotacion: number = 0;
  mostrarDetalles: boolean = true;
  copiadoSerie: boolean = false;

  // Variables para gestos touch (deslizar entre imágenes en dispositivos táctiles)
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
    this.closeEvent.emit();
  }

  /** Detecta si estamos usando evidencias */
  get usandoEvidencias(): boolean {
    return Array.isArray(this.evidencias) && this.evidencias.length > 0;
  }

  /** Lista de dispositivos para el selector */
  get dispositivos(): any[] {
    if (this.usandoEvidencias) return this.evidencias;
    return this.imagenesPorDispositivo;
  }

  /** Imágenes del dispositivo actual */
  get imagenes(): string[] {
    if (this.usandoEvidencias) {
      const item: any = this.evidencias[this.dispositivoIndex];
      if (Array.isArray(item)) return item;
      return item?.evidenciaUrls || item?.imagenes || item?.urls || [];
    }
    return this.imagenesPorDispositivo[this.dispositivoIndex] || [];
  }

  get imagenActual(): string {
    return this.imagenes?.[this.imagenSeleccionadaIndex] || '';
  }

  get dispositivoActual(): any {
    if (this.usandoEvidencias && this.evidencias && this.evidencias[this.dispositivoIndex]) {
      const item: any = this.evidencias[this.dispositivoIndex];
      if (item && typeof item === 'object') {
        const disp = item.dispositivo || item;
        return {
          ...disp,
          nombre: disp.nombre || item.nombre || '',
          marca: disp.marca || item.marca || '',
          modelo: disp.modelo || item.modelo || '',
          pulgadas: disp.pulgadas || item.pulgadas || '',
          numeroSerie: disp.numeroSerie || item.numeroSerie || '',
          comentarios: disp.comentarios || item.comentarios || item.observaciones || disp.observaciones || ''
        };
      }
    }
    return null;
  }

  /** Normaliza el valor de pulgadas para evitar repeticiones como 45"" */
  limpiarPulgadas(pulgadas: any): string {
    if (pulgadas === null || pulgadas === undefined || pulgadas === '') return '—';
    const str = String(pulgadas).replace(/["″']/g, '').trim();
    return str ? `${str}″` : '—';
  }

  cambiarDispositivo(index: number) {
    if (this.dispositivoIndex !== index) {
      this.dispositivoIndex = index;
      this.imagenSeleccionadaIndex = 0;
      this.resetTransform();
    }
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

  toggleDetalles() {
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  copiarNoSerie(numeroSerie?: string) {
    if (!numeroSerie || numeroSerie === '—') return;
    try {
      navigator.clipboard?.writeText(numeroSerie);
      this.copiadoSerie = true;
      setTimeout(() => {
        this.copiadoSerie = false;
      }, 1800);
    } catch (e) {
      console.warn('No se pudo copiar el número de serie:', e);
    }
  }

  dispositivoAnterior() {
    if (this.dispositivoIndex > 0) {
      this.cambiarDispositivo(this.dispositivoIndex - 1);
    }
  }

  dispositivoSiguiente() {
    if (this.dispositivos && this.dispositivoIndex < this.dispositivos.length - 1) {
      this.cambiarDispositivo(this.dispositivoIndex + 1);
    }
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
    link.download = `evidencia-${this.titulo || 'av'}-${this.dispositivoIndex + 1}-${this.imagenSeleccionadaIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  eliminarImagen() {
    if (this.imagenes.length === 0) return;
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
