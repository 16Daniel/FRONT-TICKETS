import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { MantenimientoMtto } from '../../../../models/mantenimiento-mtto.model';
import { FirebaseStorageService } from '../../../../services/firebase-storage.service';
import { MaintenanceMtooService } from '../../../../services/maintenance-mtto.service';

@Component({
  selector: 'app-modal-maintenance-mtto-imguploader',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-maintenance-mtto-imguploader.component.html',
  styleUrl: './modal-maintenance-mtto-imguploader.component.scss'
})
export class ModalMaintenanceMttoImguploaderComponent {
  @Input() mostrarModal: boolean = false;
  @Input() mantenimiento: MantenimientoMtto | undefined;
  @Input() titulo: string | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenesBase64: string[] = [];
  archivo: File | undefined;
  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private maintenanceMtooService: MaintenanceMtooService) { }

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

    this.firebaseStorage.cargarImagenesEvidenciasMantenimiento(this.archivo!, 'mantenimiento')
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
      case 'TERMOSTATO':
        this.mantenimiento!.mantenimientoTermostatoEvidenciaUrl = url;
        break;
      case 'PERILLAS':
        this.mantenimiento!.mantenimientoPerillasEvidenciaUrl = url;
        break;
      case 'TORNILLERIA':
        this.mantenimiento!.mantenimientoTornilleriaEvidenciaUrl = url;
        break;
      case 'RUEDAS':
        this.mantenimiento!.mantenimientoRuedasEvidenciaUrl = url;
        break;
      case 'CABLEADO':
        this.mantenimiento!.mantenimientoCableadoEvidenciaUrl = url;
        break;
      case 'TINAS':
        this.mantenimiento!.mantenimientoTinaEvidenciaUrl = url;
        break;
      case 'MANGUERAS':
        this.mantenimiento!.mantenimientoManguerasEvidenciaUrl = url;
        break;
      case 'LLAVES':
        this.mantenimiento!.mantenimientoLlavesDePasoEvidenciaUrl = url;
        break;
    }

    await this.maintenanceMtooService.update(this.mantenimiento!.id, this.mantenimiento!);
    Swal.fire("OK", "LA IMÁGEN SE SUBIÓ CORRECTAMENTE!", "success");

  }
}
