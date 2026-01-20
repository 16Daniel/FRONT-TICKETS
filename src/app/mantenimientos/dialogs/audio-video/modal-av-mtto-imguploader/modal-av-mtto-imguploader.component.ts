import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { FirebaseStorageService } from '../../../../shared/services/firebase-storage.service';
import { Maintenance6x6AvService } from '../../../services/maintenance-av.service';
import { Mantenimiento6x6AV } from '../../../interfaces/mantenimiento-av.model';

@Component({
  selector: 'app-modal-av-mtto-imguploader',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-av-mtto-imguploader.component.html',
  styleUrl: './modal-av-mtto-imguploader.component.scss'
})
export class ModalAvMttoImguploaderComponent {
  @Input() mostrarModal: boolean = false;
  @Input() mantenimiento: Mantenimiento6x6AV | undefined;
  @Input() titulo: string | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenesBase64: string[] = [];
  archivos: File[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private maintenance6x6AvService: Maintenance6x6AvService) { }


  onHide() {
    this.closeEvent.emit();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
    if (event.dataTransfer?.files?.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
  }

  async handleFiles(files: FileList) {
    const nuevasImagenes = Array.from(files);
    for (const file of nuevasImagenes) {
      const base64 = await this.convertToBase64(file);
      this.imagenesBase64.push(base64);
      this.archivos.push(file);
    }
    this.cdr.detectChanges();
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject('No se pudo convertir a base64');
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async subirImagen() {
    if (!this.archivos.length) return;

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Subiendo imágenes...',
      didOpen: () => Swal.showLoading(),
      customClass: { container: 'swal-topmost' }
    });

    try {
      const urls = await Promise.all(
        this.archivos.map(file =>
          this.firebaseStorage.cargarImagenesEvidenciasMantenimiento(file, 'sistemas')
        )
      );

      await this.actualizarUrlsImagenMantenimiento(this.titulo!, urls);

      Swal.close();
      Swal.fire("OK", "Las imágenes se subieron correctamente!", "success");
      this.closeEvent.emit();

    } catch (err) {
      console.error('Error al subir una o más imágenes:', err);
      Swal.close();
      Swal.fire("Oops...", "Error al subir imágenes!", "error");
      this.closeEvent.emit();
    }
  }

  async actualizarUrlsImagenMantenimiento(campo: string, urls: string[]) {
    if (!this.mantenimiento) return;

    switch (campo) {
      case 'CONEXIONES':
        this.mantenimiento.mantenimientoConexionesEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoConexionesEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'CABLEADO':
        this.mantenimiento.mantenimientoCableadoEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoCableadoEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'RACK':
        this.mantenimiento.mantenimientoRackEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoRackEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'CONTROLES':
        this.mantenimiento.mantenimientoControlesEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoControlesEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'NIVEL AUDIO':
        this.mantenimiento.mantenimientoNivelAudioEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoNivelAudioEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'CANALES':
        this.mantenimiento.mantenimientoCanalesEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoCanalesEvidenciaUrls || []),
          ...urls
        ];
        break;
    }

    await this.maintenance6x6AvService.update(this.mantenimiento.id, this.mantenimiento);
    Swal.fire("OK", "¡LAS IMÁGENES SE SUBIERON CORRECTAMENTE!", "success");
  }

}
