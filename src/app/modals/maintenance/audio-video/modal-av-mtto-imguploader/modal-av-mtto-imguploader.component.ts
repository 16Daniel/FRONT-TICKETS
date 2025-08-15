import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { FirebaseStorageService } from '../../../../services/firebase-storage.service';
import { Mantenimiento6x6AV } from '../../../../models/mantenimiento-av.model';
import { Maintenance6x6AvService } from '../../../../services/maintenance-av.service';

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
  archivo: File | undefined;

  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private maintenance6x6AvService: Maintenance6x6AvService) { }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
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
    this.imagenesBase64 = [];

    const file = files[0];
    this.archivo = file;
    const base64 = await this.convertToBase64(file);
    this.imagenesBase64.push(base64);

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

  subirImagen() {
    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });

    this.firebaseStorage.cargarImagenesEvidenciasMantenimiento(this.archivo!, 'audio-video')
      .then(async url => {

        this.actualizarUrlImagenMantenimiento(this.titulo!, url);

        Swal.close();
        this.closeEvent.emit();
      })
      .catch(async err => {
        Swal.close();
        Swal.fire("Oops...", "ERROR AL SUBIR LA IMÁGEN!", "error");
        console.error('Error al subir una o más imágenes:', err);
        this.closeEvent.emit();
      });
  }

  async actualizarUrlImagenMantenimiento(campo: string, url: string) {
    switch (campo) {
      case 'CONEXIONES':
        this.mantenimiento!.mantenimientoConexionesEvidenciaUrl = url;
        break;
      case 'CABLEADO':
        this.mantenimiento!.mantenimientoCableadoEvidenciaUrl = url;
        break;
      case 'RACK':
        this.mantenimiento!.mantenimientoRackEvidenciaUrl = url;
        break;
      case 'CONTROLES':
        this.mantenimiento!.mantenimientoControlesEvidenciaUrl = url;
        break;
      case 'NIVEL AUDIO':
        this.mantenimiento!.mantenimientoNivelAudioEvidenciaUrl = url;
        break;
      case 'CANALES':
        this.mantenimiento!.mantenimientoCanalesEvidenciaUrl = url;
        break;
    }

    await this.maintenance6x6AvService.update(this.mantenimiento!.id, this.mantenimiento!);
    Swal.fire("OK", "LA IMÁGEN SE SUBIÓ CORRECTAMENTE!", "success");
  }
}
