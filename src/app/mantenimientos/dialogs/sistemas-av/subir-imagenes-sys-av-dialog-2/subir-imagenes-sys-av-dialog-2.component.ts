import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { FirebaseStorageService } from '../../../../shared/services/firebase-storage.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { MantenimientoSysAv } from '../../../interfaces/mantenimiento-sys-av.interface';

@Component({
  selector: 'app-subir-imagen-sys-av-dialog-2',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './subir-imagenes-sys-av-dialog-2.component.html',
  styleUrl: './subir-imagenes-sys-av-dialog-2.component.scss'
})
export class SubirImagenesSysAv2Component {

  @Input() mostrarModal: boolean = false;
  @Input() mantenimiento: MantenimientoSysAv | undefined;
  @Input() titulo: string | undefined;

  @Output() closeEvent = new EventEmitter<boolean>();

  archivosPorDispositivo: { [index: number]: File[] } = {};
  imagenesBase64PorDispositivo: { [index: number]: string[] } = {};

  dispositivoActual: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private maintenance10x10Service: Maintenance10x10Service
  ) { }

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

  onDrop(event: DragEvent, index: number) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');

    if (event.dataTransfer?.files?.length) {
      this.handleFiles(event.dataTransfer.files, index);
    }
  }

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.handleFiles(input.files, index);
    }
  }

  async handleFiles(files: FileList, index: number) {

    if (!this.archivosPorDispositivo[index]) {
      this.archivosPorDispositivo[index] = [];
      this.imagenesBase64PorDispositivo[index] = [];
    }

    const nuevasImagenes = Array.from(files);

    for (const file of nuevasImagenes) {

      const base64 = await this.convertToBase64(file);

      this.archivosPorDispositivo[index].push(file);
      this.imagenesBase64PorDispositivo[index].push(base64);

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

    if (!this.mantenimiento) return;

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Subiendo imágenes...',
      didOpen: () => Swal.showLoading(),
      customClass: { container: 'swal-topmost' }
    });

    try {

      const dispositivos = Object.keys(this.archivosPorDispositivo);

      for (const key of dispositivos) {

        const index = Number(key);
        const archivos = this.archivosPorDispositivo[index];

        if (!archivos?.length) continue;

        const urls = await Promise.all(
          archivos.map(file =>
            this.firebaseStorage.cargarImagenesEvidenciasMantenimiento(file, 'sistemas')
          )
        );

        await this.actualizarUrlsImagenMantenimiento(this.titulo!, index, urls);

      }

      Swal.close();

      Swal.fire(
        "OK",
        "Las imágenes se subieron correctamente!",
        "success"
      );

      this.closeEvent.emit();

    } catch (err) {

      console.error('Error al subir imágenes:', err);

      Swal.close();

      Swal.fire(
        "Oops...",
        "Error al subir imágenes!",
        "error"
      );

      this.closeEvent.emit();
    }
  }

  async actualizarUrlsImagenMantenimiento(
    campo: string,
    index: number,
    urls: string[]
  ) {

    if (!this.mantenimiento) return;

    switch (campo) {

      case 'PANTALLAS':

        if (!this.mantenimiento.tvs) return;

        const tv = this.mantenimiento.tvs[index];

        tv.evidenciaUrls = [
          ...(tv.evidenciaUrls || []),
          ...urls
        ];

        break;

      case 'BOCINAS':

        if (!this.mantenimiento.bocinas) return;

        const bocina = this.mantenimiento.bocinas[index];

        bocina.evidenciaUrls = [
          ...(bocina.evidenciaUrls || []),
          ...urls
        ];

        break;
    }

    await this.maintenance10x10Service.updateAV(
      this.mantenimiento.id,
      this.mantenimiento
    );

  }

}
