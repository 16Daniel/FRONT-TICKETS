import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { AdministracionCompra, ArticuloCompra } from '../../../../../models/AdministracionCompra';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { Timestamp } from '@angular/fire/firestore';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ShoppingService } from '../../../../../services/shopping.service';
import Swal from 'sweetalert2';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Usuario } from '../../../../../models/usuario.model';
@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, DialogModule,ToastModule,FormsModule,TableModule,CalendarModule,ConfirmDialogModule,],
  providers:[MessageService,ConfirmationService],
  templateUrl: './Detalles.component.html',
})
export class DetallesComponent implements OnInit {
@Input() visible:boolean = false;
@Input() idAdmin:string = '';
@Input() itemReg:AdministracionCompra|undefined;
@Output() closeEvent = new EventEmitter<boolean>();
@Input() catStatus:any[] = []; 
@Input() catStatusPago:any[] = []; 
@Input() catMetodosPago:any[] =[]; 
public fechaentrega:Date|null|undefined; 
public fechaPago:Date|undefined|null;
public formStatus:string = ""; 
public formStatusPago:string = "";
public formPalabraClave:string = ""; 
public formMetodoPago:string =''; 
public loading:boolean = false; 
public usuario:Usuario;

constructor(
   private messageService: MessageService,
   private shopserv: ShoppingService,
  private confirmationService: ConfirmationService,
) {  this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);  }

  ngOnInit(): void 
  {
        if(this.itemReg != undefined)
          {
             if(this.itemReg!.fechaEntrega != null)
              {
                this.fechaentrega = this.itemReg!.fechaEntrega!.toDate(); 
              }

              if(this.itemReg!.fechadepago != null)
              {
                this.fechaPago = this.itemReg!.fechadepago!.toDate(); 
              }
             this.formPalabraClave = this.itemReg.palabraclave; 
             this.formStatus = this.itemReg.statuscompra; 
             this.formStatusPago = this.itemReg.statuspago;
             this.formMetodoPago = this.itemReg.metodoPago; 
          }
   }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }   

    abrirLink(Url: string) {
  window.open(Url, '_blank');
}  


async guardar()
{  
  this.loading = true; 
  if(this.fechaentrega != undefined)
    {
      this.itemReg!.fechaEntrega = Timestamp.fromDate(this.fechaentrega); 
    }

    if(this.fechaPago != undefined)
    {
      this.itemReg!.fechadepago = Timestamp.fromDate(this.fechaPago); 
    }
     this.itemReg!.palabraclave = this.formPalabraClave; 
     this.itemReg!.statuscompra = this.formStatus; 
     this.itemReg!.statuspago = this.formStatusPago; 
     this.itemReg!.metodoPago = this.formMetodoPago;
     try {
       await this.shopserv.updateCompra(this.itemReg!);  
       this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Guardado correctamente'
      });
      this.loading = false;
     } catch (error) {
       console.log(error); 
       this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar'
      });
      this.loading = false; 
     }
}

 solicitarCancelacion()
{ 
   this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'Está segur@ que desea canclar la compra?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
         this.enviarSolicitudCancelacion();
      },
      reject: () => { },
    });
}

async enviarSolicitudCancelacion()
{   
    this.itemReg!.solicitudCancelacion = true; 

    this.itemReg?.comentarios.push({comentario:'Se solicita cancelación',idUsuario:this.usuario.id,nombre:this.usuario.nombre,fecha:new Date()})

     try {
       await this.shopserv.updateCompra(this.itemReg!);  
       this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Solicitud enviada correctamente'
      });
      this.loading = false;
        this.closeEvent.emit(false);
     } catch (error) {
       console.log(error); 
       this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar'
      });
      this.loading = false; 
     }
}

 confirmarCancelacion()
{ 
   this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'Está segur@ que desea canclar la compra?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
         this.cancelarCompra(); 
      },
      reject: () => { },
    });
}

async cancelarCompra()
{   
    this.itemReg!.statuscompra = '0'; 
     try {
       await this.shopserv.updateCompra(this.itemReg!);  
       this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Solicitud enviada correctamente'
      });
      this.loading = false;
        this.closeEvent.emit(false);
     } catch (error) {
       console.log(error); 
       this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar'
      });
      this.loading = false; 
     }
}


obtenerTotalCompras(articulos:ArticuloCompra[]):number
{
  let total = 0;
  for(let item of articulos)
    {
      total = total + (item.precio * item.uds);
    }
  return total;
}


}
