import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { Compra } from '../../../compras/models/compra.model';
import { PurchaseService } from '../../../compras/services/purchase.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';

@Component({
  selector: 'app-modal-purchases-imgs-uploader',
  standalone: true,
  imports: [DialogModule, CommonModule],
  templateUrl: './modal-purchases-imgs-uploader.component.html',
  styleUrl: './modal-purchases-imgs-uploader.component.scss'
})
export class ModalPurchasesImgsUploaderComponent {
  @Input() mostrarModal: boolean = false;
  @Input() compra: Compra | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenesBase64: string[] = [];
  archivos: File[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseStorage: FirebaseStorageService,
    private purchaseService: PurchaseService
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
          this.firebaseStorage.cargarImagenesEvidenciasCompras(file)
        )
      );


      this.compra.evidenciaUrls = [
        ...(this.compra!.evidenciaUrls || []),
        ...urls
      ];

      await this.purchaseService.update(this.compra, this.compra.id);

      Swal.close();
      Swal.fire({
        title: "OK",
        text: "Las imágenes se subieron correctamente!",
        icon: "success",
        customClass: {
          container: 'swal-topmost'
        }
      });
      this.closeEvent.emit();

    } catch (err) {
      console.error('Error al subir una o más imágenes:', err);
      Swal.close();
      Swal.fire({
        title: "Oops...",
        text: "Error al subir imágenes!",
        icon: "error",
        customClass: {
          container: 'swal-topmost'
        }
      }); this.closeEvent.emit();
    }
  }
}
