import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';

@Component({
  selector: 'app-niveles-audio',
  standalone: true,
  imports: [CommonModule, ModalVisorVariasImagenesComponent],
  templateUrl: './niveles-audio.component.html',
  styleUrl: './niveles-audio.component.scss',
})
export class NivelesAudioComponent {
  @Input() sucursal!: Sucursal;

  mostrarVisorImagenes: boolean = false;
  imagenesVisor: string[] = [];

  constructor(
    private firebaseStorage: FirebaseStorageService,
    private branchesService: SucursalesService,
    private cdr: ChangeDetectorRef
  ) {}

  get imagenesAudio(): string[] {
    return Array.isArray(this.sucursal?.imagenesNivelesAudio)
      ? this.sucursal.imagenesNivelesAudio
      : [];
  }

  get totalImagenes(): number {
    return this.imagenesAudio.length;
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    Swal.fire({
      title: 'Subiendo imágenes...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      customClass: { container: 'swal-topmost' },
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const urls = await this.firebaseStorage.cargarImagenesNivelesAudio(
        fileArray,
        this.sucursal.id
      );

      if (!this.sucursal.imagenesNivelesAudio) {
        this.sucursal.imagenesNivelesAudio = [];
      }

      this.sucursal.imagenesNivelesAudio.push(...urls);
      await this.branchesService.update(this.sucursal, this.sucursal.id);
      this.cdr.detectChanges();

      Swal.fire({
        icon: 'success',
        title: 'Imágenes guardadas',
        text: 'Las imágenes de niveles de audio se subieron correctamente.',
        timer: 2000,
        showConfirmButton: false,
        customClass: { container: 'swal-topmost' },
      });
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al subir las imágenes.',
        confirmButtonColor: '#D3152A',
        customClass: { container: 'swal-topmost' },
      });
    } finally {
      input.value = '';
    }
  }

  verImagenes(): void {
    if (this.totalImagenes > 0) {
      this.imagenesVisor = [...this.imagenesAudio];
      this.mostrarVisorImagenes = true;
      this.cdr.detectChanges();
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Sin imágenes',
        text: 'No hay imágenes de Niveles de Audio para esta sucursal.',
        confirmButtonColor: '#D3152A',
        customClass: { container: 'swal-topmost' },
      });
    }
  }

  async onImagenEliminada(event: { url: string; titulo: string }): Promise<void> {
    if (!this.sucursal?.imagenesNivelesAudio) return;

    this.sucursal.imagenesNivelesAudio = this.sucursal.imagenesNivelesAudio.filter(
      (u) => u !== event.url
    );

    try {
      await this.branchesService.update(this.sucursal, this.sucursal.id);
      this.imagenesVisor = [...this.sucursal.imagenesNivelesAudio];
      if (this.imagenesVisor.length === 0) {
        this.mostrarVisorImagenes = false;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al actualizar sucursal tras eliminar imagen:', error);
    }
  }
}
