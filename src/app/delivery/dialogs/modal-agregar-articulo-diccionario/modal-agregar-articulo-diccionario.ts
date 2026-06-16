import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
import { DropdownModule } from 'primeng/dropdown';
import { CatMarcasDelivery, ModificadorArt } from '../../interfaces/diccionariodelivery';
@Component({
  selector: 'app-modal-agregar-articulo-diccionario',
  standalone: true,
  imports: [DialogModule, CommonModule, TableModule, ToastModule, ConfirmDialogModule,InputSwitchModule,FormsModule,DropdownModule],
     providers: [MessageService, ConfirmationService],
  templateUrl: './modal-agregar-articulo-diccionario.html',
})
export class ModalAgregarArticuloDiccionario implements OnInit {
   @Input() visible:boolean = false;  
   @Output() closeEvent = new EventEmitter<boolean>();
   @Output() UpdateEvent = new EventEmitter<void>();
   articulos:any[] = []; 
   articulosel:any = undefined; 
   catmarcas:CatMarcasDelivery[] = []; 
   marcasel:CatMarcasDelivery|undefined = undefined;
   modificadoresart:ModificadorArt[] = []; 
   formnombreapp:string =""
    constructor(
      public cdr: ChangeDetectorRef,
      public diccionarioService: DiccionariodeliveryService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService) { }
  
      ngOnInit(): void {
        
        this.cargarMarcas();
      }
  
    showMessage(sev: string, summ: string, det: string) {
      this.messageService.add({ severity: sev, summary: summ, detail: det });
    }

   onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

    cargarMarcas()
  {
     Swal.fire({
          target: document.body,
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor...',
          didOpen: () => Swal.showLoading(),
          customClass: {
            container: 'swal-topmost'
          }
        });
    
        this.diccionarioService.getMarcasDelivery().subscribe({
          next: (data) => {
            this.catmarcas = data;
            Swal.close()
            this.cdr.detectChanges(); 
          },
          error: (err) => 
            {
              console.error('Error al cargar datos', err)
              Swal.close();
            }
        });
  }

  cargarArticulos()
  { 
    this.articulos = []; 
    Swal.fire({
          target: document.body,
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor...',
          didOpen: () => Swal.showLoading(),
          customClass: {
            container: 'swal-topmost'
          }
        });
    
        this.diccionarioService.getArticulosICG(this.marcasel!.secciones!).subscribe({
          next: (data) => {
            Swal.close();
            this.articulos = data;
            this.cdr.detectChanges(); 
          },
          error: (err) => 
            {
              console.error('Error al cargar datos', err)
              Swal.close();
            }
        });
  }

  consultarModificadores()
  {
     Swal.fire({
          target: document.body,
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor...',
          didOpen: () => Swal.showLoading(),
          customClass: {
            container: 'swal-topmost'
          }
        });
    
        this.diccionarioService.getModificadoresArt(this.articulosel.codarticulo).subscribe({
          next: (data) => {
            Swal.close();
            console.log(data);
            this.modificadoresart = data;
            this.cdr.detectChanges(); 
          },
          error: (err) => 
            {
              console.error('Error al cargar datos', err)
              Swal.close();
            }
        });
  }

  eliminarArticuloPorIndice(indice: number): void {
    this.modificadoresart.splice(indice, 1);
    this.modificadoresart = [...this.modificadoresart];
}


guardar()
{

  for(let itemm of this.modificadoresart)
    {
      if(itemm.nombreapp.trim() == "")
        {
          this.showMessage('info','Error','Todos los modifcadores deben contener el nombre como aparece en las apps');
          return;
        }
    }

  let data = []; 
  let item = 
  {
    Id: 0,
    Tienda: this.marcasel!.id,
    Nombre: this.formnombreapp,
    Codicg: this.articulosel.codarticulo,
    Esmodificador: false,
    Codmodificador: null,
    Idmenu: this.articulosel.codarticulo
  }; 

data.push(item);

for(let itemm of this.modificadoresart)
    {
       let itm = 
        {
          Id: 0,
          Tienda: this.marcasel!.id,
          Nombre: itemm.nombreapp,
          Codicg: itemm.codarticulo,
          Esmodificador: true,
          Codmodificador: itemm.codmodificador,
          Idmenu: this.articulosel.codarticulo
        }; 
        data.push(itm);
    }
 
     Swal.fire({
          target: document.body,
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor...',
          didOpen: () => Swal.showLoading(),
          customClass: {
            container: 'swal-topmost'
          }
        });
    
        this.diccionarioService.createItem(data).subscribe({
          next: (data) => {
            Swal.close(); 
            this.showMessage('success','Success','Agregado correctamente')
            setTimeout(() => {
            this.onHide(); 
            this.UpdateEvent.emit(); 
            }, 1500);
            this.cdr.detectChanges(); 
          },
          error: (err) => 
            {
              console.error('Error al cargar datos', err)
              Swal.close();
            }
        });
}

}
