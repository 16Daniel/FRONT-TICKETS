import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { FirebaseStorageService } from '../../../../services/firebase-storage.service';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';

@Component({
  selector: 'app-modal-sys-mtto-imguploader',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-sys-mtto-imguploader.component.html',
  styleUrl: './modal-sys-mtto-imguploader.component.scss'
})
export class ModalSysMttoImguploaderComponent {
  @Input() mostrarModal: boolean = false;
  @Input() mantenimiento: Mantenimiento10x10 | undefined;
  @Input() titulo: string | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenesBase64: string[] = [];
  archivo: File | undefined;

  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private maintenance10x10Service: Maintenance10x10Service) { }

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

    this.firebaseStorage.cargarImagenesEvidenciasMantenimiento(this.archivo!, 'sistemas')
      .then(async url => {

        this.actualizarUrlImagenMantenimiento(this.titulo!, url);

        Swal.close();
        this.closeEvent.emit();

        // this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
      })
      .catch(async err => {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al subir una o más imágenes!",
        });
        // console.error('Error al subir una o más imágenes:', err);
        // this.showMessage('warn', 'Warning', 'Error al subir una o más imágenes');
        this.closeEvent.emit();
      });
  }

  async actualizarUrlImagenMantenimiento(campo: string, url: string) {
    switch (campo) {
      case 'CAJA':
        this.mantenimiento!.mantenimientoCajaEvidenciaUrl = url;
        break;
      case 'IMPRESORAS':
        this.mantenimiento!.mantenimientoImpresorasEvidenciaUrl = url;
        break;
      case 'RACK':
        this.mantenimiento!.mantenimientoRackEvidenciaUrl = url;
        break;
      case 'TPV':
        this.mantenimiento!.mantenimientoTiemposCocinaEvidenciaUrl = url;
        break;
      case 'CONTENIDOS':
        this.mantenimiento!.mantenimientoConcentradorAppsEvidenciaUrl = url;
        break;
      case 'INTERNET':
        this.mantenimiento!.mantenimientoInternetEvidenciaUrl = url;
        break;
      case 'CCTV':
        this.mantenimiento!.mantenimientoCCTVEvidenciaUrl = url;
        break;
      case 'NO BRAKES':
        this.mantenimiento!.mantenimientoNoBrakesEvidenciaUrl = url;
        break;
      case 'TIEMPOS COCINA':
        this.mantenimiento!.mantenimientoTiemposCocinaEvidenciaUrl = url;
        break;
      case 'APPS':
        this.mantenimiento!.mantenimientoConcentradorAppsEvidenciaUrl = url;
        break;
    }

    await this.maintenance10x10Service.update(this.mantenimiento!.id, this.mantenimiento!);
    Swal.fire({
      title: "OK",
      text: "La imágen se subió correctamente!",
      icon: "success"
    });

  }

}
