import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ShoppingService } from '../../../../../services/shopping.service';
import { AdministracionCompra, PagoAdicional } from '../../../../../models/AdministracionCompra';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [CommonModule, DialogModule,ToastModule,ConfirmDialogModule],
  templateUrl: './Archivos.component.html',
  providers:[ConfirmationService],
  styleUrl:'./Archivos.component.scss',
})
export class ArchivosComponent implements OnInit {
@Input() visible:boolean = false;
@Input() docs:string = ""; 
@Input() itemReg:AdministracionCompra|PagoAdicional|undefined; 
@Input() tipoDoc:number=0; 
@Output() closeEvent = new EventEmitter<boolean>();

public loading:boolean = false; 
public links:string[] = []; 

constructor(public cdr: ChangeDetectorRef,private confirmationService: ConfirmationService,private shopServ:ShoppingService) {}
ngOnInit(): void 
{  
    if(this.docs.includes('["'))
      {
          var obj = JSON.parse(this.docs); 
          for(let item of obj)
            {
              this.links.push(item); 
            }
      } else 
        {
            this.links.push(this.docs); 
        }
 }
  
  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }    

  
  downloadPdfDirect(pdfUrl: string) {
  window.open(pdfUrl, '_blank');
}


getFileNameFromUrlManual(fileUrl: string): string {
  try {
    // Decodificar la URL para manejar caracteres especiales
    const decodedUrl = decodeURIComponent(fileUrl);
    
    // Extraer el nombre del archivo después del último '/'
    const fileName = decodedUrl.split('/').pop() || '';
    
    // Remover parámetros de query si existen
    return fileName.split('?')[0];
  } catch (error) {
    console.error('Error al extraer nombre:', error);
    return '';
  }
}

esPdf(nombre:string):boolean
{
  return nombre.toLowerCase().includes(".pdf"); 
} 

esExcel(nombre:string):boolean
{
  return nombre.toLowerCase().includes(".xlsx"); 
}

confrimarEliminar(url:string,index:number)
{
  this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está segur@ que desea elimiar este archivo?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminarArchivo(url,index); 
      },
      reject: () => { },
    });
}

 eliminarArchivo(url:string,index:number)
{  this.loading = true; 
   let cerrarModal = false; 
    this.shopServ.deleteFile(url).subscribe({
      next: (data) => {
          
        this.links.splice(index, 1);

        let jdata = JSON.stringify(this.links); 
        if(this.links.length == 0){ jdata = ""; cerrarModal = true;}

      if('tipoPago' in this.itemReg!)
        {
          this.itemReg!.documentos = jdata; 
        } else
          {
              if(this.tipoDoc == 1)
              {
                this.itemReg!.factura = jdata; 
              }else
                {
                    this.itemReg!.comprobantePago = jdata;  
                }
          }

        this.updateDoc(cerrarModal);
      },
      error: (error) => {
         Swal.fire("Oops...", "ERROR AL ELIMINAR EL ARCHIVO!", "error");
        this.loading = false; 
        console.log(error);
      },
    });

}

async updateDoc(cerrar:boolean)
{
    if('tipoPago' in this.itemReg!)
      {
            await this.shopServ.updatePagoAdicional(this.itemReg); 
      } else
        {
            await this.shopServ.updateCompra(this.itemReg); 
        }
  this.loading = false; 
   this.cdr.detectChanges();
   if(cerrar)
    {
      this.closeEvent.emit(false); 
    }
}

}
