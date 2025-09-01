import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, Output, ViewChild, type OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ShoppingService } from '../../../../../services/shopping.service';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { AdministracionCompra } from '../../../../../models/AdministracionCompra';

@Component({
  selector: 'app-subir-documento',
  standalone: true,
  imports: [CommonModule, DialogModule,FileUploadModule,ToastModule,ProgressBarModule],
  providers: [MessageService],
  templateUrl: './Subir-documento.component.html',
})
export class SubirdocumentoComponent {
@ViewChild('fileUpload') fileUpload!: FileUpload;
@Output() closeEvent = new EventEmitter<boolean>();
@Input() Reg:AdministracionCompra|undefined; 
@Input() visible:boolean = false;
@Input() tipoDoc:number = 1; 
  uploadedFiles: any[] = [];
  uploading: boolean = false;

  constructor(
    private messageService: MessageService,
    private shopserv: ShoppingService // Inyecta tu servicio que contiene uploadXmlFile
  ) {}

  // Método que se ejecuta cuando se selecciona un archivo
  async onUpload(event: any) {
    let URL = ""; 
    for (const file of event.files) {
      this.uploading = true;
      try {
        let path = this.tipoDoc == 1 ? 'facturas_compras/' : 'comprobantes_pago_compras/';
        URL = await  this.shopserv.uploadFile(file,this.Reg!.id!,this.Reg!.fecha.toDate(),path); 
         this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Archivo ${file.name} subido correctamente`
          });
      } catch (error:any) {
          this.uploading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al subir ${file.name}: ${error.message}`
          });
      }
     
    } 
    if(this.tipoDoc == 1)
      {
          this.Reg!.factura = URL
      } else 
        {
            this.Reg!.comprobantePago = URL
        }
     await this.actualizarUrl(this.Reg!);
     this.uploading = false; 
     // Método 1: Limpiar archivos seleccionados
      this.fileUpload.clear();
      // Método 2: Resetear el componente completamente
      this.fileUpload.files = [];
      this.uploadedFiles = [];
      setTimeout(() => {
        this.closeEvent.emit(false); 
      }, 2000);
   
  }

  // Método para manejar errores
  onError(event: any) {
    this.uploading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en la subida del archivo'
    });
  }

  onBeforeUpload(event: any) {
    
    for(let file of event.files)
      {
            if (file && (!file.name.toLowerCase().endsWith('.xml') || !file.name.toLowerCase().endsWith('.pdf'))) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'Solo se permiten archivos PDF y XML'
      });
      event.preventDefault();
    }
      }
  }

   onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }  

async actualizarUrl(item:AdministracionCompra)
{
   await this.shopserv.updateCompra(item); 
}


}
