import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

import { PagoAdicional } from '../../interfaces/AdministracionCompra';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-subir-documento-pago-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, FileUploadModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  templateUrl: './subir-documento-pago-dialog.component.html',
  styleUrl: './subir-documento-pago-dialog.component.scss',
})
export class SubirDocumentoPagoDialogComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() Reg: PagoAdicional | undefined;
  @Input() visible: boolean = false;
  @Input() tipoDoc: number = 1;
  uploadedFiles: any[] = [];
  uploading: boolean = false;

  constructor(
    private messageService: MessageService,
    private shopserv: ShoppingService
  ) {}

  async onUpload(event: any) {
    let URL = '';
    let archivos: string[] = [];
    const path = this.tipoDoc == 1 ? 'documentos_viaticos/' : 'documentos_bonos/';

    for (const file of event.files) {
      this.uploading = true;
      try {
        URL = await this.shopserv.uploadFile(file, this.Reg!.fecha.toDate(), path, this.Reg!.id!);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Archivo ${file.name} subido correctamente`,
        });
      } catch (error: any) {
        this.uploading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al subir ${file.name}: ${error.message}`,
        });
      }
    }

    const año: string = this.Reg!.fecha.toDate().getFullYear().toString();
    const mes: string =
      this.Reg!.fecha.toDate().getMonth() + 1 < 10
        ? '0' + (this.Reg!.fecha.toDate().getMonth() + 1)
        : '' + (this.Reg!.fecha.toDate().getMonth() + 1);
    const strfecha: string = año + '-' + mes + '/';
    const docspath = path + strfecha + this.Reg!.id + '/';

    archivos = await this.shopserv.getFileUrls(docspath);

    this.Reg!.documentos = JSON.stringify(archivos);

    await this.actualizarUrl(this.Reg!);
    this.uploading = false;
    this.fileUpload.clear();
    this.fileUpload.files = [];
    this.uploadedFiles = [];
    setTimeout(() => {
      this.closeEvent.emit(false);
    }, 2000);
  }

  onError(event: any) {
    this.uploading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en la subida del archivo',
    });
  }

  onBeforeUpload(event: any) {
    for (const file of event.files) {
      if (file && (!file.name.toLowerCase().endsWith('.xml') || !file.name.toLowerCase().endsWith('.pdf'))) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Formato inválido',
          detail: 'Solo se permiten archivos PDF y XML',
        });
        event.preventDefault();
      }
    }
  }

  onHide() {
    this.closeEvent.emit(false);
  }

  isImage(name: string): boolean {
    const n = name.toLowerCase();
    return !n.endsWith('.pdf') && !n.endsWith('.xlsx') && !n.endsWith('.xls');
  }

  getFileObjectURL(file: any): string | null {
    return file?.objectURL || null;
  }

  async actualizarUrl(item: PagoAdicional) {
    await this.shopserv.updatePagoAdicional(item);
  }
}
