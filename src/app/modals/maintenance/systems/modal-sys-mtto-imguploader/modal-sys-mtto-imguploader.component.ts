import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { FirebaseStorageService } from '../../../../services/firebase-storage.service';

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

  constructor(private cdr: ChangeDetectorRef, private firebaseStorage: FirebaseStorageService) { }

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

  // async handleFiles(files: FileList) {
  //   this.imagenesBase64 = [];

  //   for (const file of Array.from(files)) {
  //     const base64 = await this.convertToBase64(file);
  //     this.imagenesBase64.push(base64);
  //   }
  // }

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
    this.firebaseStorage.cargarImagenesEvidenciasMantenimiento(this.archivo!, '')
        .then(async url => {
          
          // this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
          // this.closeEvent.emit(false);
        })
        .catch(async err => {
          // console.error('Error al subir una o más imágenes:', err);
          // this.showMessage('warn', 'Warning', 'Error al subir una o más imágenes');
          // this.closeEvent.emit(false);
        });
  }

}
