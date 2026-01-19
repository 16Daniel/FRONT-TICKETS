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
  archivos: File[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private maintenanceMtooService: MaintenanceMtooService) { }

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
    switch (campo) {
      case 'TERMOSTATO':
        this.mantenimiento!.mantenimientoTermostatoEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoTermostatoEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'PERILLAS':
        this.mantenimiento!.mantenimientoPerillasEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoPerillasEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'TORNILLERIA':
        this.mantenimiento!.mantenimientoTornilleriaEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoTornilleriaEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'RUEDAS':
        this.mantenimiento!.mantenimientoRuedasEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoRuedasEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'CABLEADO':
        this.mantenimiento!.mantenimientoCableadoEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoCableadoEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'TINAS':
        this.mantenimiento!.mantenimientoTinaEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoTinaEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'MANGUERAS':
        this.mantenimiento!.mantenimientoManguerasEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoManguerasEvidenciaUrls || []),
          ...urls,
        ];
        break;

      case 'LLAVES':
        this.mantenimiento!.mantenimientoLlavesDePasoEvidenciaUrls = [
          ...(this.mantenimiento!.mantenimientoLlavesDePasoEvidenciaUrls || []),
          ...urls,
        ];
        break;
    }

    await this.maintenanceMtooService.update(this.mantenimiento!.id, this.mantenimiento!);
    Swal.fire("OK", "Las imágenes se subieron correctamente!", "success");
  }

}
