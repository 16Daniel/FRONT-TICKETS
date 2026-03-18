import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { FirebaseStorageService } from '../../../../shared/services/firebase-storage.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { MantenimientoSysAv } from '../../../interfaces/mantenimiento-sys-av.interface';

@Component({
  selector: 'app-subir-imagen-sys-av-dialog',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './subir-imagenes-sys-av-dialog.component.html',
  styleUrl: './subir-imagenes-sys-av-dialog.component.scss'
})
export class SubirImagenesSysAvComponent {
  @Input() mostrarModal: boolean = false;
  @Input() mantenimiento: MantenimientoSysAv | undefined;
  @Input() titulo: string | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenesBase64: string[] = [];
  archivos: File[] = [];

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

      /* =======================
         PANTALLAS (TVS ARRAY)
      ======================== */
      case 'PANTALLAS':
        if (!this.mantenimiento.tvs) return;

        // this.mantenimiento.tvs = this.mantenimiento.tvs.map(tv => ({
        //   ...tv,
        //   evidenciaUrls: [
        //     ...(tv.evidenciaUrls || []),
        //     ...urls
        //   ]
        // }));
        break;

      /* =======================
         VIDEO
      ======================== */
      case 'VIDEO':
        this.mantenimiento.mantenimientoSenalVideoEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoSenalVideoEvidenciaUrls || []),
          ...urls
        ];
        break;

      /* =======================
         IMAGEN
      ======================== */
      case 'IMAGEN':
        this.mantenimiento.mantenimientoParametrosImagenEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoParametrosImagenEvidenciaUrls || []),
          ...urls
        ];
        break;

      /* =======================
         BOCINAS (ARRAY)
      ======================== */
      case 'BOCINAS':
        // if (!this.mantenimiento.bocinas) return;

        // this.mantenimiento.bocinas = this.mantenimiento.bocinas.map(bocina => ({
        //   ...bocina,
        //   evidenciaUrls: [
        //     ...(bocina.evidenciaUrls || []),
        //     ...urls
        //   ]
        // }));
        break;

      /* =======================
         AUDIO
      ======================== */
      case 'AUDIO':
        this.mantenimiento.mantenimientoTransmisionAudioEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoTransmisionAudioEvidenciaUrls || []),
          ...urls
        ];
        break;

      /* =======================
         CABLEADO
      ======================== */
      case 'CABLEADO':
        this.mantenimiento.mantenimientoOrdenamientoCableadoEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoOrdenamientoCableadoEvidenciaUrls || []),
          ...urls
        ];
        break;

      /* =======================
         RACK
      ======================== */
      case 'RACK':
        this.mantenimiento.mantenimientoLimpiezaRackEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoLimpiezaRackEvidenciaUrls || []),
          ...urls
        ];
        break;

      /* =======================
         ELECTRICO
      ======================== */
      case 'ELECTRICO':
        this.mantenimiento.mantenimientoElectricoEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoElectricoEvidenciaUrls || []),
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
