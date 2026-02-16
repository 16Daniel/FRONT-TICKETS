import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { FirebaseStorageService } from '../../../../shared/services/firebase-storage.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { Mantenimiento10x10 } from '../../../interfaces/mantenimiento-10x10.interface';

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
      case 'CAJA':
        this.mantenimiento.mantenimientoCajaEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoCajaEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'IMPRESORAS':
        this.mantenimiento.mantenimientoImpresorasEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoImpresorasEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'RACK':
        this.mantenimiento.mantenimientoRackEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoRackEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'TPV':
        this.mantenimiento.mantenimientoPuntosVentaTabletasEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoPuntosVentaTabletasEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'CONTENIDOS':
        this.mantenimiento.mantenimientoContenidosSistemaCableEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoContenidosSistemaCableEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'INTERNET':
        this.mantenimiento.mantenimientoInternetEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoInternetEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'CCTV':
        this.mantenimiento.mantenimientoCCTVEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoCCTVEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'NO BRAKES':
        this.mantenimiento.mantenimientoNoBrakesEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoNoBrakesEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'TIEMPOS COCINA':
        this.mantenimiento.mantenimientoTiemposCocinaEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoTiemposCocinaEvidenciaUrls || []),
          ...urls
        ];
        break;
      case 'APPS':
        this.mantenimiento.mantenimientoConcentradorAppsEvidenciaUrls = [
          ...(this.mantenimiento.mantenimientoConcentradorAppsEvidenciaUrls || []),
          ...urls
        ];
        break;
    }

    await this.maintenance10x10Service.update(this.mantenimiento.id, this.mantenimiento);
  }
}
