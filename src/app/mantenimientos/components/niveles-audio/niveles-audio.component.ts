import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';

@Component({
  selector: 'app-niveles-audio',
  standalone: true,
  imports: [CommonModule, ModalVisorVariasImagenesComponent],
  templateUrl: './niveles-audio.component.html',
  styleUrl: './niveles-audio.component.scss'
})
export class NivelesAudioComponent {
  @Input() sucursal!: Sucursal;

  mostrarVisorImagenes: boolean = false;
  imagenesVisor: string[] = [];

  constructor(
    private firebaseStorage: FirebaseStorageService,
    private branchesService: BranchesService
  ) {}

  async onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      Swal.fire({
        title: 'Subiendo imágenes...',
        text: 'Por favor, espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const urls = await this.firebaseStorage.cargarImagenesNivelesAudio(fileArray, this.sucursal.id);
        
        if (!this.sucursal.imagenesNivelesAudio) {
          this.sucursal.imagenesNivelesAudio = [];
        }
        
        this.sucursal.imagenesNivelesAudio.push(...urls);
        await this.branchesService.update(this.sucursal, this.sucursal.id);

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Las imágenes se han subido y guardado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al subir imágenes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al subir las imágenes.'
        });
      }
      event.target.value = ''; // Clear input
    }
  }

  verImagenes() {
    if (this.sucursal.imagenesNivelesAudio && this.sucursal.imagenesNivelesAudio.length > 0) {
      this.imagenesVisor = [...this.sucursal.imagenesNivelesAudio];
      this.mostrarVisorImagenes = true;
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Sin imágenes',
        text: 'No hay imágenes de Niveles de Audio para esta sucursal.'
      });
    }
  }

  async onImagenEliminada(event: { url: string; titulo: string }) {
    if (this.sucursal && this.sucursal.imagenesNivelesAudio) {
      this.sucursal.imagenesNivelesAudio = this.sucursal.imagenesNivelesAudio.filter(u => u !== event.url);
      try {
        await this.branchesService.update(this.sucursal, this.sucursal.id);
        this.imagenesVisor = [...this.sucursal.imagenesNivelesAudio];
        if (this.imagenesVisor.length === 0) {
          this.mostrarVisorImagenes = false;
        }
      } catch (error) {
        console.error('Error al actualizar sucursal tras eliminar imagen:', error);
      }
    }
  }
}
